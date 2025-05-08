from services.avoindata_api_service import AvoindataApiService as Avoindata
from services.hankeikkuna_api_service import HankeikkunaApiService as Hankeikkuna
from services.db_service import DBService
from utils.avoindata import process_government_proposals
from utils.avoindata import process_preparatory_documents
from utils.hankeikkuna import process_hankeikkuna_data

import time

db_service = DBService()


def export_all_avoindata():
    """Vie kaikki avoindata tietokantaan, jos tietokanta on tyhjä."""
    max_pages = 20
    existing_count = db_service.count_documents()
    if existing_count > 0:
        print(f"Tietokannassa on jo {existing_count} dokumenttia. Haku peruutettu.")
        return
    else:
        export_government_proposals(max_pages)
        export_asiantuntijalausunnot_from_api_to_db(max_pages)
        export_valiokunnan_lausunnot_from_api_to_db(max_pages)
        export_valiokunnan_mietinnot_from_api_to_db(max_pages)
        db_service.create_search_index()


def export_all_hankeikkuna_data():
    """Vie kaikki käsitelty hankeikkuna-data tietokantaan"""
    per_page = 10
    page = 1
    max_pages = 20
    max_retries = 5
    for page in range(1, max_pages + 1):
        if page % 10 == 1:
            print(f"Haetaan hankeikkuna dataa sivulta {page}")
        retries = 0
        while retries < max_retries:
            try:
                export_one_page_of_hankeikkuna_data(per_page, page)
                break
            except Exception as e:
                retries += 1
                print(f"Virhe sivulla {page}: {e}. Yritys {retries}/{max_retries}")
                if retries >= max_retries:
                    print(
                        f"Virhe sivulla {page}, eikä yrityksiä enää jäljellä. Prosessi keskeytetään."
                    )
                    break
                time.sleep(5)


def export_one_page_of_hankeikkuna_data(per_page: int, page: int):
    """Vie sivullinen käsiteltyä hankeikkuna-dataa tietokantaan"""
    try:
        hankeikkuna_data = Hankeikkuna.fetch_data_from_api(per_page, page)
    except Exception as api_error:
        print(f"Virhe API-kutsussa: {api_error}")
        return

    try:
        submission_data = process_hankeikkuna_data(hankeikkuna_data)
    except Exception as processing_error:
        print(f"Virhe datan käsittelyssä: {processing_error}")
        return
    for i in range(len(submission_data)):
        try:
            preparatory_id = submission_data[i]["preparatoryIdentifier"]
            submissions = submission_data[i]["submissions"]
            he_id = submission_data[i]["proposalIdentifier"]
            document_type = "lausunnot"
            db_service.add_preparatory_id(he_id, preparatory_id)
            for i in range(len(submissions)):
                submission = submissions[i]
                db_service.push_document(submission, he_id, document_type)
        except Exception as db_error:
            print(f"Virhe tietokantaoperaatiossa: ({he_id}){db_error}")


def export_government_proposals(max_pages=1000):
    per_page = 10
    i = 0
    while True:
        if i%10 == 0:
            print(f"Haetaan avoindataa sivulta {i + 1}")
        try:
            if i >= max_pages:
                print("Sivujen maksimimäärä saavutettu.")
                break
            document_type = "Hallituksen+esitys"
            avoindata_data = Avoindata.fetch_data_from_api(
                per_page, i + 1, document_type
            )
            if not avoindata_data:
                print("Tapahtui virhe. Dataa ei voitu hakea.")
                break
            government_proposals = process_government_proposals(avoindata_data)
            for proposal in government_proposals:
                if not db_service.document_exists(proposal["heTunnus"]):
                    db_service.add_document(proposal)

            if not avoindata_data.get("hasMore"):
                print("Ei enempää dataa haettavana.")
                break
        except Exception as e:
            print(f"Virhe haettaessa avoindataa: {e}")
            break
        i += 1
    print("Kaikki avoindata tallennettu tietokantaan.")


def export_asiantuntijalausunnot_from_api_to_db(max_pages):
    """Hae kaikki asiantuntijalausunnot avoindatasta ja vie ne tietokantaan"""
    i = 0
    while True:
        if i >= max_pages:
            print("Sivujen maksimimäärä saavutettu.")
            break
        if i%10 == 1:
            print(f"Haetaan asiantuntijalausuntoja sivulta {i}")
        per_page = 30
        page = i
        document_type = "Asiantuntijalausunto"
        api_data = Avoindata.fetch_data_from_api(per_page, page, document_type)
        has_more = api_data["hasMore"]
        data = process_preparatory_documents(api_data)
        for element in data:
            he_id = element["heTunnus"]
            document_type = "asiantuntijalausunnot"
            db_service.push_document(element, he_id, document_type)
        if not has_more:
            break
        i += 1


def export_valiokunnan_lausunnot_from_api_to_db(max_pages=1000):
    """Hae kaikki valiokunnan lausunnot avoindatasta ja vie ne tietokantaan"""
    i = 0
    while True:
        if i >= max_pages:
            print("Sivujen maksimimäärä saavutettu.")
            break
        if i%10 == 1:
            print(f"Haetaan valiokunnan lausuntoja sivulta {i}")
        per_page = 30
        page = i
        document_type = "Valiokunnan+lausunto"
        api_data = Avoindata.fetch_data_from_api(per_page, page, document_type)
        has_more = api_data["hasMore"]
        data = process_preparatory_documents(api_data)
        for element in data:
            he_id = element["heTunnus"]
            document_type = "valiokuntaAsiakirjat"
            db_service.push_document(element, he_id, document_type)
        if not has_more:
            break
        i += 1


def export_valiokunnan_mietinnot_from_api_to_db(max_pages=1000):
    """Hae kaikki valiokunnan mietinnöt avoindatasta ja vie ne tietokantaan"""
    i = 0
    while True:
        if i >= max_pages:
            print("Sivujen maksimimäärä saavutettu.")
            break
        if i%10 == 1:
            print(f"Haetaan valiokunnan mietintöjä sivulta {i}")
        per_page = 30
        page = i
        document_type = "Valiokunnan+mietintö"
        api_data = Avoindata.fetch_data_from_api(per_page, page, document_type)
        has_more = api_data["hasMore"]
        data = process_preparatory_documents(api_data)
        for element in data:
            he_id = element["heTunnus"]
            document_type = "valiokuntaAsiakirjat"
            db_service.push_document(element, he_id, document_type)
        if not has_more:
            break
        i += 1


if __name__ == "__main__":
    export_all_avoindata()
    export_all_hankeikkuna_data()
