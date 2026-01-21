import re
import tempfile
import logging
import requests
import fitz

logger = logging.getLogger(__name__)

VALIOKUNNAT = [
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
    "Stora utskottet",
    "Grundlagsutskottet",
    "Utrikesutskottet",
    "Finansutskottet",
    "Revisionsutskottet",
    "Arbetslivs- och jämställdhetsutskottet",
    "Ekonomiutskottet",
    "Framtidsutskottet",
    "Försvarsutskottet",
    "Förvaltningsutskottet",
    "Jord- och skogsbruksutskottet",
    "Kommunikationsutskottet",
    "Kulturutskottet",
    "Lagutskottet",
    "Miljöutskottet",
    "Social- och hälsovårdsutskottet",
    "Underrättelsetillsynsutskottet",
]

VALIOKUNTA_PATTERN = r"\b(" + "|".join(map(re.escape, VALIOKUNNAT)) + r")\b"
HE_PATTERN = r"HE\s\d{1,3}/\d{4}"


def extract_text_from_pdf(pdf_url: str) -> str | None:
    """Lue PDF:n teksti ensimmäiseltä sivulta."""
    if not pdf_url:
        return None

    response = requests.get(pdf_url)
    if response.status_code != 200:
        logger.error(f"Failed to fetch PDF: {pdf_url} ({response.status_code})")
        return None

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=True) as tmp:
        tmp.write(response.content)
        tmp.flush()
        with fitz.open(tmp.name) as pdf:
            text = pdf[0].get_text()
            return re.sub(r"\s+", " ", text).strip()


def find_in_pdf(url: str, pattern: str) -> str:
    """Etsi regex-osuma PDF:n tekstistä."""
    text = extract_text_from_pdf(url)
    if not text:
        return ""
    match = re.search(pattern, text, flags=re.IGNORECASE)
    return match.group(0) if match else ""


def find_valiokunta_name_from_pdf(url: str) -> str:
    return find_in_pdf(url, VALIOKUNTA_PATTERN)


def find_proposal_identifier_from_pdf(url: str) -> str:
    return find_in_pdf(url, HE_PATTERN)
