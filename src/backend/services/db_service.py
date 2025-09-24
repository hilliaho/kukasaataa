from pymongo import MongoClient
from dotenv import load_dotenv
import os

class DBService:
    _client = None

    def __init__(self):
        if not DBService._client:
            load_dotenv()
            mongodb_uri = os.getenv("MONGODB_URI")
            if not mongodb_uri:
                raise ValueError("MONGODB_URI is not set in the .env file")
            DBService._client = MongoClient(mongodb_uri)

        self.db = DBService._client["kukasaataa"]
        self.collection = self.db["projects"]

    def fetch_documents(self, page_number, page_size, search_query=""):
        skip_count = (page_number - 1) * page_size
        query = {}

        if search_query:
            query = {
                "$or": [
                    {"heNimi": {"$regex": search_query, "$options": "i"}},
                    {"heTunnus": {"$regex": search_query, "$options": "i"}},
                    {"heSisalto": {"$regex": search_query, "$options": "i"}},
                ]
            }

        documents = list(
            self.collection.find(query)
            .sort("paivamaara")
            .skip(skip_count)
            .limit(page_size)
        )

        for doc in documents:
            doc["_id"] = str(doc["_id"])
        return documents

    def count_documents(self, search_query=""):
        query = {}

        if search_query:
            query = {
                "$or": [
                    {"heNimi": {"$regex": search_query, "$options": "i"}},
                    {"heTunnus": {"$regex": search_query, "$options": "i"}},
                ]
            }

        try:
            count = self.collection.count_documents(query)
            print("count: ", count)
            return count
        except Exception as e:
            print(f"Error in count_documents: {e}")
            return 0
