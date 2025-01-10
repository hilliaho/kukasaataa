import requests
import json


request_url = "https://api.hankeikkuna.fi/api/v2/kohteet/haku"
headers = {
    "accept": "application/json;charset=UTF-8",
    "Content-Type": "application/json",
}
data = {
    "muokattuPaivaAlku": "2024-01-01T00:00:00",
    "muokattuPaivaLoppu": "2024-11-01T23:59:59",
    "size": 10,
    "sort": [
        {
            "field": "kohde.muokattu",
            "order": "ASC",
        }
    ],
    "tyyppi": ["LAINSAADANTO"],
}
response = requests.post(request_url, headers=headers, data=json.dumps(data))
if response.status_code == 200:
    data = response.json()
    print(data)
else:
    print("Fetching data failed:", response.status_code)
