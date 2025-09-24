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
        if "heTunnus" in document:
            match = re.match(r"(HE|KAA)\s+(\d+)/(\d{4})", document["heTunnus"])
            if match:
                document["tunnusTyyppi"] = match.group(1)
                document["numero"] = int(match.group(2))
                document["vuosi"] = int(match.group(3))
            else:
                logging.warning(f"Tunnusta ei voitu jäsentää: {document['heTunnus']}")

        result = self.collection.insert_one(document)
        project_id = document.get('heTunnus') or document.get('valmistelutunnus')
        logger.info(f"Lisätty {project_id}")
        return result.inserted_id

    def document_exists(self, document_id):
        return self.collection.find_one({"heTunnus": document_id}) is not None

    def create_search_index(self):
        existing_indexes = self.collection.list_indexes()
        index_exists = any(
            idx["key"]
            == {"heNimi": "text", "heTunnus": "text", "valmistelutunnus": "text"}
            for idx in existing_indexes
        )
        if not index_exists:
            self.collection.create_index(
                [("heNimi", "text"), ("heTunnus", "text"), ("valmistelutunnus", "text")]
            )
            logger.info("Tekstihakemisto luotu.")
        else:
            logger.info("Tekstihakemisto on jo olemassa.")

    def push_document(self, data, he_id, document_type):
        result = self.collection.update_one(
            {"heTunnus": he_id}, {"$addToSet": {f"dokumentit.{document_type}": data}}
        )
        if result.modified_count > 0:
            logger.info(f"Lisätty {he_id}: {document_type}: {data['nimi']}")
        return result.modified_count

    def get_last_modified(self, document_type):
        try:
            last_doc = self.collection_metadata.find_one(
                {"dokumenttiTyyppi": document_type}
            )
            if last_doc and "viimeisinMuokattu" in last_doc:
                return last_doc["viimeisinMuokattu"]
            return 0
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
