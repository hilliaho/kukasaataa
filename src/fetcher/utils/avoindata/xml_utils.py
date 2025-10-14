import xml.etree.ElementTree as ET
import logging

logger = logging.getLogger(__name__)

XML_NAMESPACE = "{http://www.vn.fi/skeemat/metatietoelementit/2010/04/27}"


def parse_xml_value(xml_data: str, tag: str) -> str | None:
    if not xml_data:
        return None

    wrapped_xml = f"<root>{xml_data}</root>"
    try:
        root = ET.fromstring(wrapped_xml)
        elems = root.findall(f".//{XML_NAMESPACE}{tag}")
        return elems[0].text if elems else None
    except ET.ParseError as e:
        logger.error(f"XML-parsinta epäonnistui ({tag}): {e}")
        return None


def parse_xml_name(xml_data: str) -> str | None:
    return parse_xml_value(xml_data, "NimekeTeksti")


def parse_xml_doc_type(xml_data: str) -> str | None:
    return parse_xml_value(xml_data, "AsiakirjatyyppiNimi")
