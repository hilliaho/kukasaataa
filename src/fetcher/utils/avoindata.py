import re
import xml.etree.ElementTree as ET
import fitz
import requests
import tempfile
import logging
from datetime import datetime


logger = logging.getLogger(__name__)


def process_preparatory_documents(api_data):
    """Käsittele valmisteluasiakirjat ja muokkaa ne sopivaan muotoon"""
    result_list = api_data["rowData"]
    processed_list = []

    for i in range(len(result_list)):
        xml_name = result_list[i][3]
        xml_doc_type = result_list[i][4]
        xml_url = result_list[i][5]
        doc_type = parse_xml_doc_type(xml_doc_type)
        url_match = re.search(r'href="([^"]+)"', xml_url)
        url = url_match.group(1) if url_match else ""
        if doc_type == "Asiantuntijalausunto":
            name_row = parse_xml_name(xml_name)
            name = remove_unnecessary_info_from_name(name_row)
        else:
            name = find_valiokunta_name_from_pdf(url)
        identifier = result_list[i][1]
        if identifier is None:
            identifier = find_proposal_identifier_from_pdf(url)

        identifier = remove_vp(identifier)

        if all([identifier, doc_type, name, url]):
            processed_element = {
                "heTunnus": identifier,
                "nimi": name,
                "url": url,
            }
            processed_list.append(processed_element)
    return processed_list


def find_proposal_identifier_from_pdf(url):
    """Etsi HE-tunnus PDF-tiedostosta"""
    if len(url) == 0:
        return ""
    text = extract_text_from_pdf(url)
    match = re.search(r"HE\s\d{1,3}/\d{4}", text)
    return match.group(0) if match else None


def find_valiokunta_name_from_pdf(url):
    """Etsi valiokunnan nimi pdf-tiedostosta"""
    if len(url) == 0:
        return ""
    text = extract_text_from_pdf(url)
    valiokunnat = [
        "Hallintovaliokunta",
        "Lakivaliokunta",
        "Liikenne- ja viestintävaliokunta",
        "Maa- ja metsätalousvaliokunta",
        "Pankkivaliokunta",
        "Perustuslakivaliokunta",
        "Puolustusvaliokunta",
        "Sivistysvaliokunta",
        "Sosiaali- ja terveysvaliokunta",
        "Suuri valiokunta",
        "Talousvaliokunta",
        "Tarkastusvaliokunta",
        "Tiedusteluvalvontavaliokunta",
        "Toinen lakivaliokunta",
        "Tulevaisuusvaliokunta",
        "Työelämä- ja tasa-arvovaliokunta",
        "Ulkoasiainvaliokunta",
        "Valtiovarainvaliokunta",
        "Ympäristövaliokunta",
    ]

    name_pattern = r"\b(" + "|".join(map(re.escape, valiokunnat)) + r")\b"
    matches = re.findall(name_pattern, text, flags=re.IGNORECASE)
    return matches[0] if len(matches) > 0 else ""


def extract_text_from_pdf(pdf_url):
    response = requests.get(pdf_url)
    if response.status_code != 200:
        logger.error(f"Failed to fetch PDF: {response.status_code}")
        return None

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=True) as tmp:
        tmp.write(response.content)
        tmp.flush()

        text = ""
        with fitz.open(tmp.name) as pdf:
            text = pdf[0].get_text()
            clean_text = re.sub(r"\s+", " ", text).strip()
        return clean_text


def remove_vp(he_id):
    he_id = he_id.split(",")[0]
    return re.sub(r"\s*vp$", "", he_id)


def remove_unnecessary_info_from_name(text):
    text = text.strip()
    name = re.sub(
        r"^[A-Z]+\s\d{1,3}/\d{4}\svp\s[A-Za-z]+\s\d{2}\.\d{2}\.\d{4}\s", "", text
    )
    name = re.sub(r"\s*Asiantuntijalausunto$", "", name)
    return name


def process_government_proposals(api_data):
    """Käsittele hallituksen esitykset ja muokkaa ne sopivaan muotoon"""
    result_list = api_data["rowData"]
    processed_list = []
    for i in range(len(result_list)):
        xml_name = result_list[i][3]
        xml_url = result_list[i][5]
        name_row = parse_xml_name(xml_name)
        name = remove_unnecessary_info_from_name(name_row)
        url_match = re.search(r'href="([^"]+)"', xml_url)
        url = ""
        proposal_content = None
        if url_match:
            url = url_match.group(1)
            proposal_content = extract_text_from_pdf(url)
        if proposal_content is None:
            proposal_content = ""
        he_id = result_list[i][1]
        he_id = remove_vp(he_id)
        try:
            date = datetime.fromisoformat(result_list[i][2])
        except (ValueError, TypeError):
            date = datetime.now()
        if he_id is None:
            he_id = find_proposal_identifier_from_pdf(url)
        if all([he_id, name, url]):
            processed_element = {
                "heTunnus": he_id,
                "paivamaara": date,
                "heNimi": name, #2025-09-22 16:54:25
                "heUrl": url,
                "heSisalto": proposal_content,
                "dokumentit": {
                    "lausunnot": [],
                    "asiantuntijalausunnot": [],
                    "valiokunnanLausunnot": [],
                    "valiokunnanMietinnot": [],
                },
            }
            processed_list.append(processed_element)
    return processed_list


def parse_xml_name(xml_data):
    wrapped_xml = f"<root>{xml_data}</root>"

    try:
        root = ET.fromstring(wrapped_xml)
        names = root.findall(
            ".//{http://www.vn.fi/skeemat/metatietoelementit/2010/04/27}NimekeTeksti"
        )
        name = names[0]
        return name.text
    except ET.ParseError as e:
        logger.error(f"XML-parsinta epäonnistui: {e}")
        return None


def parse_xml_doc_type(xml_data):
    wrapped_xml = f"<root>{xml_data}</root>"

    try:
        root = ET.fromstring(wrapped_xml)
        names = root.findall(
            ".//{http://www.vn.fi/skeemat/metatietoelementit/2010/04/27}AsiakirjatyyppiNimi"
        )
        name = names[0]
        return name.text
    except ET.ParseError as e:
        logger.error(f"XML-parsinta epäonnistui: {e}")
        return None


def get_avoindata_document_index(api_data):
    index = api_data["rowData"][0][0]
    return int(index) if index else None


def continue_condition(data):
    if data.get("hasMore"):
        return True
    return False
