import logging
from typing import Callable, Iterable, Optional

from services.avoindata_api_service import AvoindataApiService
from services.hankeikkuna_api_service import HankeikkunaApiService
from utils.avoindata import processors as avoindata
from utils.hankeikkuna import processors as hankeikkuna
from utils.retry import retry_with_backoff


logger = logging.getLogger(__name__)


class Exporter:
    def __init__(
        self,
        db_service,
        avoindata_service=AvoindataApiService,
        hankeikkuna_service=HankeikkunaApiService,
        per_page: int = 30,
        max_pages: int = 10000,
    ):
        self.db = db_service
        self.avoindata_service = avoindata_service
        self.hankeikkuna_service = hankeikkuna_service
        self.per_page = per_page
        self.max_pages = max_pages

        self.jobs = [
            {
                "document_type": "Hallituksen+esitys",
                "collection": "hallituksenEsitykset",
                "processor": avoindata.process_government_proposals,
                "checker": self.db.he_exists,
                "index_getter": avoindata.get_avoindata_document_index,
                "continue_checker": avoindata.continue_condition,
                "adder": self.db.add_document,
                "updater": self.db.add_he_info,
            },
            {
                "document_type": "Regeringens+proposition",
                "collection": "regeringensPropositioner",
                "processor": avoindata.process_government_proposals,
                "checker": self.db.he_exists,
                "index_getter": avoindata.get_avoindata_document_index,
                "continue_checker": avoindata.continue_condition,
                "adder": self.db.add_document,
                "updater": self.db.add_he_info,
            },
            {
                "document_type": "Kansalaisaloite",
                "collection": "kansalaisaloitteet",
                "processor": avoindata.process_government_proposals,
                "checker": self.db.he_exists,
                "index_getter": avoindata.get_avoindata_document_index,
                "continue_checker": avoindata.continue_condition,
                "adder": self.db.add_document,
                "updater": self.db.add_he_info,
            },
            {
                "document_type": "Medborgarinitiativ",
                "collection": "medborgarinitiativ",
                "processor": avoindata.process_government_proposals,
                "checker": self.db.he_exists,
                "index_getter": avoindata.get_avoindata_document_index,
                "continue_checker": avoindata.continue_condition,
                "adder": self.db.add_document,
                "updater": self.db.add_he_info,
            },
            {
                "document_type": "Hankeikkuna",
                "collection": "heLuonnokset",
                "processor": hankeikkuna.find_proposal_drafts,
                "checker": self.db.draft_exists,
                "index_getter": hankeikkuna.get_hankeikkuna_modified_date,
                "continue_checker": hankeikkuna.continue_condition,
                "adder": self.db.add_drafts,
                "updater": None,
            },
            {
                "document_type": "Asiantuntijalausunto",
                "collection": "asiantuntijalausunnot",
                "processor": avoindata.process_preparatory_documents,
                "checker": None,
                "index_getter": avoindata.get_avoindata_document_index,
                "continue_checker": avoindata.continue_condition,
                "adder": lambda doc: self.db.push_document(
                    doc, doc["heTunnus"], "asiantuntijalausunnot"
                ),
                "updater": None,
            },
            {
                "document_type": "Valiokunnan+lausunto",
                "collection": "valiokunnanLausunnot",
                "processor": avoindata.process_preparatory_documents,
                "checker": None,
                "index_getter": avoindata.get_avoindata_document_index,
                "continue_checker": avoindata.continue_condition,
                "adder": lambda doc: self.db.push_committee_document(
                    doc, doc["heTunnus"], "valiokunnanLausunnot", "fi"
                ),
                "updater": None,
            },
            {
                "document_type": "Utl%C3%A5tande", # Valiokunnan lausunto ruotsiksi
                "collection": "utlatande",
                "processor": avoindata.process_preparatory_documents,
                "checker": None,
                "index_getter": avoindata.get_avoindata_document_index,
                "continue_checker": avoindata.continue_condition,
                "adder": lambda doc: self.db.push_committee_document(
                    doc, doc["heTunnus"], "valiokunnanLausunnot", "sv"
                ),
                "updater": None,
            },
            {
                "document_type": "Valiokunnan+mietintö",
                "collection": "valiokunnanMietinnot",
                "processor": avoindata.process_preparatory_documents,
                "checker": None,
                "index_getter": avoindata.get_avoindata_document_index,
                "continue_checker": avoindata.continue_condition,
                "adder": lambda doc: self.db.push_committee_document(
                    doc, doc["heTunnus"], "valiokunnanMietinnot", "fi"
                ),
                "updater": None,
            },
            {
                "document_type": "Bet%C3%A4nkande", # Valiokunnan mietintö ruotsiksi
                "collection": "betankade",
                "processor": avoindata.process_preparatory_documents,
                "checker": None,
                "index_getter": avoindata.get_avoindata_document_index,
                "continue_checker": avoindata.continue_condition,
                "adder": lambda doc: self.db.push_committee_document(
                    doc, doc["heTunnus"], "valiokunnanMietinnot", "sv"
                ),
                "updater": None,
            },
            {
                "document_type": "Hankeikkuna",
                "collection": "lausuntokierroksenLausunnot",
                "processor": hankeikkuna.process_hankeikkuna_data,
                "checker": None,
                "index_getter": hankeikkuna.get_hankeikkuna_modified_date,
                "continue_checker": hankeikkuna.continue_condition,
                "adder": lambda doc: self.db.push_submissions(
                    doc, doc["proposalIdentifier"], "lausuntokierroksenLausunnot"
                ),
                "updater": None,
            },
        ]

    def create_search_index(self) -> None:
        self.db.create_search_index()

    def export(
        self,
        document_type: str,
        collection_name: str,
        processor: Callable[[dict], Iterable[dict]],
        checker: Optional[Callable[[str], bool]],
        index_getter: Callable[[dict], str],
        adder: Callable[[dict], None],
        updater: Optional[Callable[[dict], None]],
        continue_checker: Optional[Callable[[dict], bool]],
    ) -> None:
        db_index = self.db.get_last_modified(collection_name)
        search_after = ""
        for i in range(1, self.max_pages):
            logger.info(f"Fetching {collection_name} from page {i}")
            if document_type == "Hankeikkuna":
                api_data = retry_with_backoff(
                    lambda: self.hankeikkuna_service.fetch_data_from_api(
                        self.per_page,
                        db_index.strftime("%Y-%m-%dT%H:%M:%S"),
                        search_after,
                    )
                )
                search_after = api_data["nextSearchAfter"]
            else:
                api_data = retry_with_backoff(
                    lambda: self.avoindata_service.fetch_data_from_api(
                        self.per_page, i, document_type
                    )
                )
            if not api_data:
                logger.info(f"No documents found for {collection_name} on page {i}")
                break
            api_index = index_getter(api_data)
            if i == 1:
                new_index = api_index
            if db_index >= api_index:
                logger.info(f"{collection_name} is up to date")
                break
            for doc in processor(api_data) or []:
                if not checker or not checker(doc):
                    adder(doc)
                elif updater:
                    updater(doc)
            if not continue_checker or not continue_checker(api_data):
                break
        if new_index:
            self.db.add_last_modified(collection_name, new_index)

    def export_all(self) -> None:
        for job in self.jobs:
            self.export(
                document_type=job["document_type"],
                collection_name=job["collection"],
                processor=job["processor"],
                checker=job["checker"],
                index_getter=job["index_getter"],
                continue_checker=job["continue_checker"],
                adder=job["adder"],
                updater=job["updater"],
            )
