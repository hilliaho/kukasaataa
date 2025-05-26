from services.avoindata_api_service import AvoindataApiService as Avoindata
from services.hankeikkuna_api_service import HankeikkunaApiService as Hankeikkuna
from services.db_service import DBService
from utils.avoindata import process_government_proposals
from utils.avoindata import process_preparatory_documents
from utils.avoindata import get_avoindata_document_index
from utils.hankeikkuna import process_hankeikkuna_data
from utils.hankeikkuna import get_hankeikkuna_modified_date

import time
import datetime

db_service = DBService()


def export_all_avoindata():
    """Vie kaikki avoindata tietokantaan"""
    max_pages = 10000
    export_government_proposals(max_pages)
    export_documents_from_api_to_db(max_pages, document_type_1="Asiantuntijalausunto", document_type_2="asiantuntijalausunnot")
    export_documents_from_api_to_db(max_pages, document_type_1="Valiokunnan+lausunto", document_type_2="valiokunnanLausunnot")
    export_documents_from_api_to_db(max_pages, document_type_1="Valiokunnan+mietintö", document_type_2="valiokunnanMietinnot")
    db_service.create_search_index()


def export_all_hankeikkuna_data():
    """Vie kaikki käsitelty hankeikkuna-data tietokantaan"""
    per_page = 10
    max_pages = 10000
    max_retries = 5

    newest_submission_date = db_service.get_last_modified("lausuntokierroksenLausunnot")
    if not newest_submission_date:
        newest_submission_date = datetime.datetime.min


    for page in range(1, max_pages + 1):
        for attempt in range(1, max_retries+1):
            try:
                result = export_one_page_of_hankeikkuna_data(per_page, page, newest_submission_date)
                if result is None:
                    print("Lausuntokierroksen lausunnot ovat ajan tasalla.")
                    db_service.add_last_modified("lausuntokierroksenLausunnot", newest_submission_date)
                    return
                if isinstance(result, datetime.datetime):
                    newest_submission_date = result
            except Exception as e:
                print(f"Virhe sivulla {page}: {e}. Yritys {attempt}/{max_retries}")
                if attempt >= max_retries:
                    print(
                        f"Virhe sivulla {page}, eikä yrityksiä enää jäljellä. Prosessi keskeytetään."
                    )
                    return
                time.sleep(5)
    db_service.add_last_modified("lausuntokierroksenLausunnot", newest_submission_date)



def export_one_page_of_hankeikkuna_data(per_page: int, page: int, last_modified_date_in_db: datetime.datetime):
    """Vie sivullinen käsiteltyä hankeikkuna-dataa tietokantaan"""

    hankeikkuna_data = Hankeikkuna.fetch_data_from_api(per_page, page)

    submission_data = process_hankeikkuna_data(hankeikkuna_data)

    if last_modified_date_in_db == 0:
        last_modified_date_in_db = datetime.datetime.min

    last_modified_date_in_api = get_hankeikkuna_modified_date(hankeikkuna_data)

    if last_modified_date_in_db.date() > last_modified_date_in_api.date():
        return None

    for item in submission_data:
        preparatory_id = item["preparatoryIdentifier"]
        submissions = item["submissions"]
        he_id = item["proposalIdentifier"]

        db_service.add_preparatory_id(he_id, preparatory_id)
        for submission in submissions:
            db_service.push_document(submission, he_id, "lausunnot")

    return last_modified_date_in_api if page == 1 else True



def export_government_proposals(max_pages=1000):
    per_page = 10
    i = 0
    latest_document_index_in_db = db_service.get_last_modified("hallituksenEsitykset")
    newest_document_index_in_api = latest_document_index_in_db
    try:
        while True:
            if i > max_pages:
                break
            document_type = "Hallituksen+esitys"
            api_data = Avoindata.fetch_data_from_api(
                per_page, i, document_type
            )
            if not api_data:
                print(f"Sivulta {i} ei löytynyt hallituksen esityksiä.")
                break
            if int(latest_document_index_in_db) >= get_avoindata_document_index(api_data):
                print("Hallituksen esitykset ovat ajan tasalla.")
                break
            if i == 0:
                newest_document_index_in_api = get_avoindata_document_index(api_data)
            government_proposals = process_government_proposals(api_data)
            for proposal in government_proposals:
                if not db_service.document_exists(proposal["heTunnus"]):
                    db_service.add_document(proposal)

            if not api_data.get("hasMore"):
                break
            i += 1
        db_service.add_last_modified("hallituksenEsitykset", newest_document_index_in_api)
    except Exception as e:
        print(f"Virhe haettaessa avoindataa: {e}")




def export_documents_from_api_to_db(max_pages, document_type_1, document_type_2):
    """Hae kaikki dokumentit avoindatasta ja vie ne tietokantaan"""
    i = 0
    latest_document_index_in_db = db_service.get_last_modified(document_type_2)
    newest_document_index_in_api = latest_document_index_in_db
    while True:
        if i >= max_pages:
            break
        print(f"Haetaan sivulta {i}")
        per_page = 30
        page = i
        api_data = Avoindata.fetch_data_from_api(per_page, page, document_type_1)
        if not api_data:
            print(f"Sivulta {i} ei löytynyt dokumentteja {document_type_2}.")
            break
        if i == 0:
            newest_document_index_in_api = get_avoindata_document_index(api_data)
        if int(latest_document_index_in_db) >= newest_document_index_in_api:
            print(f"{document_type_2} ovat ajan tasalla.")
            break
        has_more = api_data["hasMore"]
        data = process_preparatory_documents(api_data)
        for element in data:
            he_id = element["heTunnus"]
            db_service.push_document(element, he_id, document_type_2)
        if not has_more:
            break
        i += 1
    db_service.add_last_modified(document_type_2, newest_document_index_in_api)


if __name__ == "__main__":
    export_all_avoindata()
    export_all_hankeikkuna_data()
