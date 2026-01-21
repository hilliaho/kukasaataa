import re
import tempfile
import logging
import requests
import fitz

logger = logging.getLogger(__name__)


def extract_text_from_pdf(pdf_url: str) -> str:
    """Lataa PDF ja palauta ensimmäisen sivun teksti siistittynä."""
    if not pdf_url:
        return ""

    try:
        response = requests.get(pdf_url, timeout=15)
        response.raise_for_status()
    except requests.RequestException as e:
        logger.error(f"PDF:n lataus epäonnistui: {pdf_url} ({e})")
        return ""

    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=True) as tmp:
            tmp.write(response.content)
            tmp.flush()
            with fitz.open(tmp.name) as pdf:
                text = pdf[0].get_text()
                return re.sub(r"\s+", " ", text).strip()
    except Exception as e:
        logger.error(f"Virhe PDF-tiedoston lukemisessa ({pdf_url}): {e}")
        return ""


def find_proposal_name_from_draft_content(content_txt: str) -> str:
    """Etsi luonnoksen nimi PDF-tekstistä."""
    if not content_txt:
        return ""
    match = re.search(
        r"(Hallituksen esitys eduskunnalle.*?)(?=ESITYKSEN PÄÄASIALLINEN SISÄLTÖ)",
        content_txt,
        re.S,
    )
    if not match:
        match = re.search(
            r"(Regeringens proposition till riksdage.*?)(?=PROPOSITIONENS HUVUDSAKLIGA INNEHÅLL)",
            content_txt,
            re.S,
    )
    return match.group(1).strip() if match else ""
