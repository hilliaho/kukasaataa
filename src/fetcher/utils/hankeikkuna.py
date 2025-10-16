from datetime import datetime
import requests
import fitz
import tempfile
import re
import logging
from services.db_service import DBService

db_service = DBService()
logger = logging.getLogger(__name__)


def process_hankeikkuna_data(data):
    """Poimi sivullisesta hankeikkuna-dataa lausuntokierroksen lausunnot, valmistelutunnukset ja he-tunnukset"""
    submission_data = []
    size = data["size"]
    for i in range(size):
        preparatory_identifier = find_preparatory_identifier(data, i)
        proposal_identifier = find_proposal_identifier(data, i)
        if not proposal_identifier:
            proposal_identifier = preparatory_identifier
        documents = find_documents(data, i)
        submissions = find_submissions(documents)
        if not proposal_identifier or not submissions:
            continue
        project_submissions = {
            "preparatoryIdentifier": preparatory_identifier,
            "proposalIdentifier": proposal_identifier,
            "submissions": submissions,
        }
        submission_data.append(project_submissions)
    return submission_data


def get_hankeikkuna_modified_date(data):
    return datetime.now()


def find_preparatory_identifier(data, i):
    identifier = data["result"][i]["kohde"]["tunnus"]
    return identifier


def find_proposal_identifier(data, i):
    he_id_list = data["result"][i]["lainsaadanto"]["heTiedot"]["heNumerot"]
    if he_id_list:
        return he_id_list[0]
    return ""


def find_documents(data, i):
    return data["result"][i]["asiakirjat"]


def find_submissions(documents):
    submissions = []
    for i in range(len(documents)):
        if documents[i]["tyyppi"] == "LAUSUNTO":
            name = (
                documents[i]["nimi"].get("fi")
                or documents[i]["nimi"].get("sv")
                or documents[i]["nimi"].get("en")
            )
            url = documents[i]["url"]
            if url and name:
                submission = {"nimi": name, "url": url}
                submissions.append(submission)
    return submissions


def find_proposal_drafts(data):
    drafts = []
    match_list = [
        "he-luonnos",
        "he luonnos",
        "luonnos he",
        "luonnos hallituksen esitykseksi",
    ]
    size = data["size"]
    for i in range(size):
        preparatory_identifier = find_preparatory_identifier(data, i)
        proposal_identifier = find_proposal_identifier(data, i)

        documents = find_documents(data, i)

        if not documents:
            continue

        for j in range(len(documents)):
            name = documents[j]["nimi"]["fi"]
            url = documents[j]["url"]
            try:
                date = datetime.fromisoformat(documents[j]["luotu"])
            except (TypeError, ValueError):
                date = datetime.now()
            if not name or not url:
                continue
            for match in match_list:
                if match in name.lower():
                    if ".pdf" in url.lower():
                        proposal_content = extract_text_from_pdf(url)
                        proposal_name = find_proposal_name_from_draft_content(
                            proposal_content
                        )
                        if not proposal_name:
                            continue
                        draft = {
                            "dokumentit": {
                                "heLuonnokset": [
                                    {
                                        "nimi": "Luonnos: " + proposal_name,
                                        "url": url,
                                    }
                                ],
                                "lausunnot": [],
                                "asiantuntijalausunnot": [],
                                "valiokunnanLausunnot": [],
                                "valiokunnanMietinnot": [],
                            },
                            "heTunnus": proposal_identifier,
                            "paivamaara": date,
                            "heSisalto": proposal_content,
                            "valmistelutunnus": preparatory_identifier,
                        }
                        drafts.append(draft)
                        break
    return drafts


def find_proposal_name_from_draft_content(content_txt):
    match = re.search(
        r"(Hallituksen esitys eduskunnalle.*?)(?=ESITYKSEN PÄÄASIALLINEN SISÄLTÖ)",
        content_txt,
        re.S,
    )
    if match:
        return match.group(1).strip()


def extract_text_from_pdf(pdf_url):
    response = requests.get(pdf_url)
    if response.status_code != 200:
        logger.warning(f"Failed to fetch PDF: {response.status_code}")
        return ""

    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=True) as tmp:
            tmp.write(response.content)
            tmp.flush()

            text = ""
            with fitz.open(tmp.name) as pdf:
                text = pdf[0].get_text()
                clean_text = re.sub(r"\s+", " ", text).strip()
            return clean_text
    except Exception as e:
        logger.warning(f"Virhe pdf-tiedoston lukemisessa: {e}")


def continue_condition(data):
    if len(data["result"]) > 0:
        return True
    return False
