import requests
import logging

logger = logging.getLogger(__name__)

class AvoindataApiService:

    def fetch_data_from_api(per_page, page, document_type):
        """Hae dokumentteja avoindata-rajapinnasta"""
        if document_type in ["Regeringens+proposition", "Medborgarinitiativ", "Utl%C3%A5tande", "Bet%C3%A4nkande"]:
            lang_code = "sv"
        else:
            lang_code = "fi"
        url = f"https://avoindata.eduskunta.fi/api/v1/vaski/asiakirjatyyppinimi?perPage={per_page}&page={page}&filter={document_type}&languageCode={lang_code}"
        response = requests.get(url)
        if response.status_code == 200:
            return response.json()
        else:
            logger.error("Fetching data failed:", response.status_code)
            return None
