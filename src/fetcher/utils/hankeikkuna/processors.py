from datetime import datetime
import logging
import re
from .pdf_utils import extract_text_from_pdf, find_proposal_name_from_draft_content

logger = logging.getLogger(__name__)


def process_hankeikkuna_data(data: dict) -> list[dict]:
    """Poimi hankeikkuna-datasta valmistelutunnus, he-tunnus ja lausunnot."""
    submission_data = []

    for item in data.get("result", []):
        preparatory_identifier = item.get("kohde", {}).get("tunnus")
        proposal_identifier = _extract_proposal_identifier(item) or preparatory_identifier
        documents = item.get("asiakirjat", [])
        submissions = _extract_submissions(documents)

        if not proposal_identifier or not submissions:
            continue

        submission_data.append({
            "preparatoryIdentifier": preparatory_identifier,
            "proposalIdentifier": proposal_identifier,
            "submissions": submissions,
        })

    return submission_data


def get_hankeikkuna_modified_date(data: dict) -> datetime:
    return datetime.now()


def _extract_proposal_identifier(item: dict) -> str:
    """Etsi HE-tunnus hankeikkuna-datasta."""
    he_list = item.get("lainsaadanto", {}).get("heTiedot", {}).get("heNumerot", [])
    return he_list[0] if he_list else ""


def _extract_submissions(documents: list[dict]) -> list[dict]:
    """Palauta lausuntoasiakirjat listana."""
    submissions = []
    for doc in documents:
        if doc.get("tyyppi") != "LAUSUNTO":
            continue

        names = doc.get("nimi", {})
        name = names.get("fi") or names.get("sv") or names.get("en")
        url = doc.get("url")

        if name and url:
            submissions.append({"nimi": name, "url": url})
    return submissions


def find_proposal_drafts(data: dict) -> list[dict]:
    """Etsi HE-luonnokset hankeikkuna-datasta."""
    drafts = []
    lang_code = "fi"
    match_list = [
        "he-luonnos",
        "he luonnos",
        "luonnos he",
        "luonnos hallituksen esitykseksi",
    ]

    for item in data.get("result", []):
        preparatory_identifier = item.get("kohde", {}).get("tunnus")
        proposal_identifier = _extract_proposal_identifier(item)
        documents = item.get("asiakirjat", [])

        for doc in documents:
            name = doc.get("nimi", {}).get("fi", "")
            url = doc.get("url", "")
            if not name or not url:
                continue

            if not any(match in name.lower() for match in match_list):
                continue

            try:
                date = datetime.fromisoformat(doc.get("luotu"))
            except (ValueError, TypeError):
                date = datetime.now()

            if not url.lower().endswith(".pdf"):
                continue

            proposal_content = extract_text_from_pdf(url)
            proposal_name = find_proposal_name_from_draft_content(proposal_content)

            if not proposal_name:
                continue

            drafts.append({
                "dokumentit": {
                    "heLuonnokset": [
                        {"nimi": f"Luonnos: {proposal_name}", "url": url}
                    ],
                    "lausunnot": [],
                    "asiantuntijalausunnot": [],
                    "valiokunnanLausunnot": [],
                    "valiokunnanMietinnot": [],
                },
                "heTunnus": proposal_identifier,
                "paivamaara": date,
                "heSisalto":  {f"{lang_code}": proposal_content},
                "valmistelutunnus": preparatory_identifier,
            })

    return drafts


def continue_condition(data: dict) -> bool:
    """Tarkista, onko rajapinta-dataa vielä"""
    return len(data.get("result", [])) > 0
