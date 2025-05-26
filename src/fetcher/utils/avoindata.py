import re
import xml.etree.ElementTree as ET
import pdfplumber
import requests
import datetime

def process_preparatory_documents(api_data):
    """Käsittele valmisteluasiakirjat ja muokkaa ne sopivaan muotoon"""
    result_list = api_data["rowData"]
    processed_list = []

    for i in range(len(result_list)):
        xml_name = result_list[i][3]
        xml_doc_type = result_list[i][4]
        xml_url = result_list[i][5]

        name_row = parse_xml_name(xml_name)
        doc_type = parse_xml_doc_type(xml_doc_type)
        name = remove_unnecessary_info_from_name(name_row)

        url_match = re.search(r'href="([^"]+)"', xml_url)
        url = url_match.group(1) if url_match else ""

        identifier = result_list[i][1]
        if identifier is None:
            identifier = find_proposal_identifier_from_pdf(url)

        identifier = remove_vp(identifier)

        if all([identifier, doc_type, name, url]):
            processed_element = {
                "heTunnus": identifier,
                "asiakirjatyyppi": doc_type,
                "nimi": name,
                "url": url,
            }
            processed_list.append(processed_element)

    return processed_list



def find_proposal_identifier_from_pdf(url):
    """Etsi HE-tunnus PDF-tiedostosta"""
    print(f"Etsitään HE-tunnusta PDF-tiedostosta: {url}")
    text = extract_text_from_pdf(url)
    match = re.search(r"HE\s\d{1,3}/\d{4}", text)
    return match.group(0) if match else None



def extract_text_from_pdf(pdf_url):
    response = requests.get(pdf_url)
    if response.status_code == 200:
        temp_pdf_path = "temp.pdf"
        with open(temp_pdf_path, "wb") as f:
            f.write(response.content)
        text = ""
        with pdfplumber.open(temp_pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text()
        return text
    else:
        print(f"Failed to fetch PDF: {response.status_code}")
        return None


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
        if url_match:
            url = url_match.group(1)
        he_id = result_list[i][1]
        he_id = remove_vp(he_id)
        if he_id is None:
            he_id = find_proposal_identifier_from_pdf(url)
        if all([he_id, name, url]):
            processed_element = {
                "heTunnus": he_id,
                "heNimi": name,
                "heUrl": url,
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
    
def get_avoindata_document_index(api_data):
    index = api_data["rowData"][0][0]
    return int(index) if index else None


