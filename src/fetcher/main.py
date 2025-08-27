import time
import datetime
import logging

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

from services.avoindata_api_service import AvoindataApiService as Avoindata
from services.hankeikkuna_api_service import HankeikkunaApiService as Hankeikkuna
from services.db_service import DBService
from utils.avoindata import (
    process_government_proposals,
    process_preparatory_documents,
    get_avoindata_document_index,
)
from utils.hankeikkuna import (
    process_hankeikkuna_data,
    get_hankeikkuna_modified_date,
)
from utils.retry import retry_with_backoff

db_service = DBService()


def export_all_avoindata():
    """Vie kaikki avoindata tietokantaan"""
    max_pages = 1000
    document_types = [
        ("Asiantuntijalausunto", "asiantuntijalausunnot"),
        ("Valiokunnan+lausunto", "valiokunnanLausunnot"),
        ("Valiokunnan+mietintö", "valiokunnanMietinnot"),
    ]

    proposal_types = [
        ("Hallituksen+esitys", "hallituksenEsitykset"),
        ("Kansalaisaloite", "kansalaisaloitteet"),
    ]

    for api_doc_type, db_collection in proposal_types:
        export_documents(
            document_type=api_doc_type,
            collection_name=db_collection,
            processor=process_government_proposals,
            checker=db_service.document_exists,
            adder=db_service.add_document,
            max_pages=max_pages,
        )

    for doc_type_1, doc_type_2 in document_types:
        export_documents(
            document_type=doc_type_1,
            collection_name=doc_type_2,
            processor=process_preparatory_documents,
            checker=None,
            adder=lambda doc: db_service.push_document(
                doc, doc["heTunnus"], doc_type_2
            ),
            max_pages=max_pages,
        )

    db_service.create_search_index()


def export_all_hankeikkuna_data():
    """Hae hankeikkunasta lausuntokierroksen lausunnot ja vie ne tietokantaan"""
    per_page = 10
    max_pages = 1000
    max_retries = 5

    db_last_modified = db_service.get_last_modified("lausuntokierroksenLausunnot") or datetime.datetime.min
    newest_submission_date = db_last_modified

    for page in range(1, max_pages + 1):
        result = retry_with_backoff(
            lambda: export_one_page_of_hankeikkuna_data(per_page, page, db_last_modified),
            max_retries=max_retries,
            delay=5
        )

        if result is None:
            logging.info("Lausuntokierroksen lausunnot ovat ajan tasalla")
            break
        
        if result is True:
            logging.info("Kaikki hankeikkuna-data on käsitelty")
            break

        if isinstance(result, datetime.datetime):
            newest_submission_date = result

    db_service.add_last_modified("lausuntokierroksenLausunnot", newest_submission_date)



def export_one_page_of_hankeikkuna_data(
    per_page: int, page: int, last_modified: datetime.datetime
):
    """Vie sivullinen käsiteltyä hankeikkuna-dataa tietokantaan"""
    logging.info(f"Haetaan Hankeikkuna-dataa sivulta {page}:")
    hankeikkuna_data = Hankeikkuna.fetch_data_from_api(per_page, page)
    if len(hankeikkuna_data["result"])==0:
        return True
    submission_data = process_hankeikkuna_data(hankeikkuna_data)
    last_modified = last_modified or datetime.datetime.min

    last_api_date = get_hankeikkuna_modified_date(hankeikkuna_data)
    if last_modified.date() > last_api_date.date():
        return None

    for item in submission_data:
        he_id = item["proposalIdentifier"]
        db_service.add_preparatory_id(he_id, item["preparatoryIdentifier"])
        for submission in item["submissions"]:
            db_service.push_document(submission, he_id, "lausunnot")

    return last_api_date if page == 1 else True


def export_documents(
    document_type, collection_name, processor, checker, adder, max_pages
):
    i = 0
    per_page = 30
    latest_index = db_service.get_last_modified(collection_name)
    latest_index = int(latest_index or 0)
    newest_index = latest_index

    while i < max_pages:
        logging.info(f"Haetaan {collection_name} sivulta {i}")
        api_data = Avoindata.fetch_data_from_api(per_page, i, document_type)
        if not api_data:
            logging.info(f"Sivulta {i} ei löytynyt dokumentteja {collection_name}.")
            break

        current_index = get_avoindata_document_index(api_data)
        if i == 0:
            newest_index = current_index

        if latest_index >= newest_index:
            logging.info(f"{collection_name} ovat ajan tasalla.")
            break

        for doc in processor(api_data):
            if not checker or not checker(doc.get("heTunnus")):
                adder(doc)

        if not api_data.get("hasMore"):
            break

        i += 1

    db_service.add_last_modified(collection_name, newest_index)


if __name__ == "__main__":
    export_all_avoindata()
    export_all_hankeikkuna_data()
