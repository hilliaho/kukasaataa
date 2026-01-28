from exporters.exporter import Exporter
from services.db_service import DBService
import logging

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",datefmt='%Y-%m-%d %H:%M'
)

if __name__ == "__main__":
    db = DBService()
    db.ensure_indexes()

    exporter = Exporter(db)
    exporter.export_all()


