import requests
import json
import logging

logger = logging.getLogger(__name__)


class HankeikkunaApiService:

    def fetch_data_from_api(per_page: int, last_modified: str, search_after: str):
        request_url = "https://api.hankeikkuna.fi/api/v2/kohteet/haku"
        headers = {
            "accept": "application/json;charset=UTF-8",
            "Content-Type": "application/json",
        }
        if not search_after:
            query = {
                "muokattuPaivaAlku": last_modified,
                "size": per_page,
                "sort": [
                    {
                        "field": "kohde.muokattu",
                        "order": "DESC",
                    }
                ],
                "tyyppi": ["LAINSAADANTO"],
            }
        else:
            query = {
                "muokattuPaivaAlku": last_modified,
                "searchAfter": search_after,
                "size": per_page,
                "sort": [
                    {
                        "field": "kohde.muokattu",
                        "order": "DESC",
                    }
                ],
                "tyyppi": ["LAINSAADANTO"],
            }
        response = requests.post(
            request_url, headers=headers, data=json.dumps(query)
        )
        if response.status_code == 200:
            data = response.json()
        else:
            logger.error("Fetching data failed:", response.status_code)
        return data
