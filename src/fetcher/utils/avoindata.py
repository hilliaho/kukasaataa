import re
import xml.etree.ElementTree as ET
from services.db_service import DBService

db_service = DBService()


def process_preparatory_documents(api_data):
    """Käsittele valmisteluasiakirjat ja muokkaa ne sopivaan muotoon"""
    result_list = api_data["rowData"]
    processed_list = []
    for i in range(len(result_list)):
        identifier = result_list[i][1]
        identifier = remove_vp(identifier)
        xml_name = result_list[i][3]
        xml_doc_type = result_list[i][4]
        xml_url = result_list[i][5]
        name_row = parse_xml_name(xml_name)
        doc_type = parse_xml_doc_type(xml_doc_type)
        name = remove_unnecessary_info_from_name(name_row)
        url_match = re.search(r'href="([^"]+)"', xml_url)
        url = ""
        if url_match:
            url = url_match.group(1)
        processed_element = {
            "heTunnus": identifier,
            "asiakirjatyyppi": doc_type,
            "nimi": name,
            "url": url,
        }
        processed_list.append(processed_element)
    return processed_list


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


def process_and_store_government_proposals(api_data):
    """Käsittelee ja tallentaa datan tietokantaan."""
    government_proposals = parse_government_proposals(api_data)
    for proposal in government_proposals:
        if not db_service.document_exists(proposal["heTunnus"]):
            db_service.add_document(proposal)
            print(f"Lisätty dokumentti {proposal['heTunnus']} tietokantaan")
        else:
            print(f"Dokumentti {proposal['heTunnus']} on jo tietokannassa")


def parse_government_proposals(api_data):
    """Käsittele hallituksen esitykset ja muokkaa ne sopivaan muotoon"""
    result_list = api_data["rowData"]
    processed_list = []
    for i in range(len(result_list)):
        he_id = result_list[i][1]
        he_id = remove_vp(he_id)
        xml_name = result_list[i][3]
        xml_url = result_list[i][5]
        name_row = parse_xml_name(xml_name)
        name = remove_unnecessary_info_from_name(name_row)
        url_match = re.search(r'href="([^"]+)"', xml_url)
        url = ""
        if url_match:
            url = url_match.group(1)
        else:
            continue
        processed_element = {
            "heTunnus": he_id,
            "heNimi": name,
            "heUrl": url,
            "dokumentit": {
                "lausunnot": [],
                "asiantuntijalausunnot": [],
                "valiokuntaAsiakirjat": [],
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
        print(f"XML-parsinta epäonnistui: {e}")
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
        print(f"XML-parsinta epäonnistui: {e}")
        return None


def find_preparatory_identifier(text):
    pattern = r"[A-Z]{2,3}\d{3}:\d{2}/\d{4}"
    matches = re.findall(pattern, text)
    print(f"Matches found: {matches}")
    return matches if matches else None


def create_document(he_identifier, name, proposal_url, preparatory_identifier):
    return {
        "heNimi": name,
        "heTunnus": he_identifier,
        "valmistelutunnus": preparatory_identifier,
        "heUrl": proposal_url,
    }
