from services.avoindata_api_service import AvoindataApiService as Avoindata
from services.db_service import DBService
from utils.avoindata import process_and_store_government_proposals

db_service = DBService()

def export_all_avoindata():
    """Vie kaikki hallituksen esitykset tietokantaan."""
    per_page = 30
    print("Haetaan avoindataa...")
    i = 0
    while True:
        print(f"Haetaan sivulta {i + 1}")
        try:
            document_type = "Hallituksen+esitys"
            avoindata_data = Avoindata.fetch_data_from_api(per_page, i+1, document_type)
            if not avoindata_data:
                print("Tapahtui virhe. Dataa ei voitu hakea.")
                break
            process_and_store_government_proposals(avoindata_data)
            if not avoindata_data.get("hasMore"):
                print("Ei enempää dataa haettavana.")
                break
        except Exception as e:
            print(f"Virhe haettaessa avoindataa: {e}")
            break
        i += 1
    print("Kaikki avoindata tallennettu tietokantaan.")

if __name__ == "__main__":
    export_all_avoindata()