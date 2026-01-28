import re
import logging
from datetime import datetime
from .xml_utils import parse_xml_name, parse_xml_doc_type
from .pdf_utils import (
    find_proposal_identifier_from_pdf,
    find_valiokunta_name_from_pdf,
    extract_text_from_pdf,
)

VALIOKUNTA_MAP = {
    "suuri valiokunta": 1,
    "stora utskottet": 1,
    "perustuslakivaliokunta": 2,
    "grundlagsutskottet": 2,
    "ulkoasiainvaliokunta": 3,
    "utrikesutskottet": 3,
    "valtiovarainvaliokunta": 4,
    "finansutskottet": 4,
    "tarkastusvaliokunta": 5,
    "revisionsutskottet": 5,
    "hallintovaliokunta": 6,
    "förvaltningsutskottet": 6,
    "lakivaliokunta": 7,
    "lagutskottet": 7,
    "liikenne- ja viestintävaliokunta": 8,
    "kommunikationsutskottet": 8,
    "maa- ja metsätalousvaliokunta": 9,
    "jord- och skogsbruksutskottet": 9,
    "puolustusvaliokunta": 10,
    "försvarsutskottet": 10,
    "sivistysvaliokunta": 11,
    "kulturutskottet": 11,
    "sosiaali- ja terveysvaliokunta": 12,
    "social- och hälsovårdsutskottet": 12,
    "talousvaliokunta": 13,
    "ekonomiutskottet": 13,
    "tiedusteluvalvontavaliokunta": 14,
    "underrättelsetillsynsutskottet": 14,
    "tulevaisuusvaliokunta": 15,
    "framtidsutskottet": 15,
    "työelämä- ja tasa-arvovaliokunta": 16,
    "arbetslivs- och jämställdhetsutskottet": 16,
    "ympäristövaliokunta": 17,
    "miljöutskottet": 17,
}


# --- YLEISET APUFUNKTIOT ---


def clean_he_id(he_id: str | None) -> str:
    if not he_id:
        return ""
    he_id = he_id.split(",")[0]
    he_id = re.sub(r"\s*rd$", "", he_id.strip())
    he_id = re.sub(r"\s*vp$", "", he_id.strip())
    match = re.match(r"(RP)\s+(\d+)/(\d{4})", he_id)
    if match:
        he_id = he_id[2:]
        he_id = "HE" + he_id
    match = re.match(r"(MI)\s+(\d+)/(\d{4})", he_id)
    if match:
        he_id = he_id[2:]
        he_id = "KAA" + he_id
    return he_id


def remove_unnecessary_info_from_name(text: str | None) -> str:
    if not text:
        return ""
    text = text.strip()
    name = re.sub(
        r"^[A-Z]+\s\d{1,3}/\d{4}\svp\s[A-Za-z]+\s\d{2}\.\d{2}\.\d{4}\s", "", text
    )
    return re.sub(r"\s*Asiantuntijalausunto$", "", name).strip()


def get_avoindata_document_index(api_data: dict) -> int | None:
    if not api_data.get("rowData"):
        return 0
    index = api_data.get("rowData")[0][0]
    return int(index) if index else 0


def continue_condition(data: dict) -> bool:
    return bool(data.get("hasMore"))


# --- DOKUMENTTIEN KÄSITTELY ---


def process_preparatory_documents(api_data: dict) -> list[dict]:
    processed_list = []

    for row in api_data.get("rowData", []):
        xml_name, xml_doc_type, xml_url = row[3], row[4], row[5]
        doc_type = parse_xml_doc_type(xml_doc_type)
        url_match = re.search(r'href="([^"]+)"', xml_url or "")
        url = url_match.group(1) if url_match else ""

        if doc_type == "Asiantuntijalausunto":
            name = remove_unnecessary_info_from_name(parse_xml_name(xml_name))
        else:
            name = find_valiokunta_name_from_pdf(url)

        identifier = clean_he_id(row[1] or find_proposal_identifier_from_pdf(url))

        doc_id = row[0]

        if name.lower() in VALIOKUNTA_MAP.keys():
            doc_id = VALIOKUNTA_MAP[name.lower()]

        lang_code = row[7]

        if all([identifier, doc_type, name, url, doc_id, lang_code]):
            processed_list.append(
                {
                    "heTunnus": identifier,
                    "nimi": name,
                    "url": url,
                    "id": doc_id,
                    "kielikoodi": lang_code,
                }
            )
    return processed_list


def process_government_proposals(api_data: dict) -> list[dict]:
    processed_list = []

    for row in api_data.get("rowData", []):
        xml_name, xml_url = row[3], row[5]
        name = remove_unnecessary_info_from_name(parse_xml_name(xml_name))

        url_match = re.search(r'href="([^"]+)"', xml_url or "")
        url = url_match.group(1) if url_match else ""

        he_id = clean_he_id(row[1]) or find_proposal_identifier_from_pdf(url)
        lang_code = row[7]

        try:
            date = datetime.fromisoformat(row[2])
        except (ValueError, TypeError):
            date = datetime.now()

        proposal_content = extract_text_from_pdf(url) or ""

        if all([he_id, name, url]):
            processed_list.append(
                {
                    "heTunnus": he_id,
                    "paivamaara": date,
                    "heNimi": {f"{lang_code}": name},
                    "heUrl": {f"{lang_code}": url},
                    "heSisalto": {f"{lang_code}": proposal_content},
                    "dokumentit": {
                        "heLuonnokset": [],
                        "lausuntokierroksenLausunnot": [],
                        "asiantuntijalausunnot": [],
                        "valiokunnanLausunnot": [],
                        "valiokunnanMietinnot": [],
                    },
                }
            )
    return processed_list
