from pymongo import MongoClient
from dotenv import load_dotenv
import os
import re
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class DBService:

    def __init__(self):
        load_dotenv()
        mongodb_uri = os.getenv("MONGODB_URI")
        if not mongodb_uri:
            raise ValueError("MONGODB_URI is not set in the .env file")
        self.client = MongoClient(mongodb_uri)
        self.db = self.client["kukasaataa"]
        self.collection = self.db["projects"]
        self.collection_metadata = self.db["projects_metadata"]

    def add_document(self, document):
        he_id = document.get("heTunnus")
        if he_id:
            match = re.match(r"(HE|KAA)\s+(\d+)/(\d{4})", he_id)
            if match:
                document["tunnusTyyppi"] = match.group(1)
                document["numero"] = int(match.group(2))
                document["vuosi"] = int(match.group(3))
            else:
                logger.warning("Ei lisätty tunnusta", he_id)
        elif document.get("valmistelutunnus"):

            match = re.match(
                r"^[A-ZÅÄÖ]+(\d+):(\d+)/(\d{4})$", document["valmistelutunnus"]
            )
            if match:
                document["tunnusTyyppi"] = "valmistelu"
                numero_str = match.group(1) + match.group(2)
                document["numero"] = int(numero_str)
                document["vuosi"] = int(match.group(3))
            else:
                logger.warning("Ei lisätty tunnusta", document["valmistelutunnus"])
        else:
            logger.warning(f"Tunnusta ei voitu jäsentää: {he_id}")
            return None
        if document["vuosi"] < 2016:
            return None
        result = self.collection.insert_one(document)
        project_id = he_id or document.get("valmistelutunnus")
        logger.info(f"Lisätty {project_id}")
        return result.inserted_id

    def draft_exists(self, api_doc):
        preparatory_id = api_doc.get("valmistelutunnus")
        he_id = api_doc.get("heTunnus")
        db_doc = self.collection.find_one({"valmistelutunnus": preparatory_id})
        if db_doc is not None:
            if he_id and not db_doc.get("heTunnus"):
                logger.info(f"Päivitetään {preparatory_id}: lisätään he-tunnus {he_id}")
                return False
            return True
        return False

    def he_exists(self, api_doc):
        he_id = api_doc.get("heTunnus")
        db_doc = self.collection.find_one({"heTunnus": he_id})
        if db_doc is not None:
            return True
        return False

    def create_search_index(self):
        existing_indexes = self.collection.list_indexes()
        index_exists = any(
            idx["key"]
            == {
                "heNimi.fi": "text",
                "heNimi.sv": "text",
                "heTunnus": "text",
                "valmistelutunnus": "text",
                "heSisalto.fi": "text",
                "heSisalto.sv": "text",
            }
            for idx in existing_indexes
        )
        if not index_exists:
            self.collection.create_index(
                [
                    ("heNimi.fi", "text"),
                    ("heNimi.sv", "text"),
                    ("heTunnus", "text"),
                    ("valmistelutunnus", "text"),
                    ("heSisalto.fi", "text"),
                    ("heSisalto.sv", "text"),
                ]
            )
            logger.info("Tekstihakemisto luotu.")
        else:
            logger.info("Tekstihakemisto on jo olemassa.")

    def add_he_info(self, data):
        lang_code = list(data.get("heNimi").keys())[0]
        name = data.get("heNimi").get(f"{lang_code}")
        he_id = data.get("heTunnus")
        url = data.get("heUrl").get(f"{lang_code}")
        if not (url and name and he_id):
            return
        db_doc = self.collection.find_one({"heTunnus": he_id}, {f"heNimi.{lang_code}": { "exists": True }})
        if db_doc is not None:
            logger.info(f"{he_id} kielikoodilla {lang_code} on jo tietokannassa")
            return

        content = data.get("heSisalto").get(f"{lang_code}")
        result = self.collection.update_one(
            {"heTunnus": he_id},
            {
                "$set": {
                    f"heNimi.{lang_code}": name,
                    f"heUrl.{lang_code}": url,
                    f"heSisalto.{lang_code}": content,
                }
            },
            upsert=True,
        )
        if result.modified_count > 0:
            logger.info(f"Lisätty puuttuvat he-tiedot {he_id}")
        else:
            logger.info(f"Ei lisätty tietoja {he_id}")


    def push_document(self, data, he_id, document_type):
        result = self.collection.update_one(
            {"heTunnus": he_id}, {"$addToSet": {f"dokumentit.{document_type}": data}}
        )
        if result.modified_count > 0:
            logger.info(f"Lisätty {he_id}: {document_type}: {data['nimi']}")
        return result.modified_count

    def push_submissions(self, project, he_id, document_type):
        for submission in project.get("submissions"):
            self.push_document(submission, he_id, document_type)

    def add_drafts(self, data):
        he_id = data.get("heTunnus")
        if he_id and self.he_exists(data):
            self.push_document(
                data["dokumentit"]["heLuonnokset"][0], data["heTunnus"], "heLuonnokset"
            )
        else:
            self.add_document(data)

    def get_last_modified(self, document_type):
        try:
            last_doc = self.collection_metadata.find_one(
                {"dokumenttiTyyppi": document_type}
            )

            if not last_doc:
                return (
                    datetime.fromisoformat("2015-01-01T00:00:00")
                    if document_type in ["lausuntokierroksenLausunnot", "heLuonnokset"]
                    else 0
                )

            modified_value = last_doc.get("viimeisinMuokattu")
            if not modified_value:
                return (
                    datetime.fromisoformat("2015-01-01T00:00:00")
                    if document_type in ["lausuntokierroksenLausunnot", "heLuonnokset"]
                    else 0
                )

            return modified_value

        except Exception as e:
            logger.error(f"Error in get_last_modified: {e}")
            return 0

    def add_last_modified(self, document_type, data):
        logger.info(f"Adding last modified date for {document_type}: {data}")
        try:
            self.collection_metadata.update_one(
                {"dokumenttiTyyppi": document_type},
                {"$set": {"viimeisinMuokattu": data}},
                upsert=True,
            )
        except Exception as e:
            logger.error(f"Error in add_last_modified: {e}")
        return None
