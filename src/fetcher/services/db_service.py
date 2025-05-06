from pymongo import MongoClient
from dotenv import load_dotenv
import os
import re


class DBService:
    def __init__(self):
        load_dotenv()
        mongodb_uri = os.getenv("MONGODB_URI")
        if not mongodb_uri:
            raise ValueError("MONGODB_URI is not set in the .env file")
        self.client = MongoClient(mongodb_uri)
        self.db = self.client["kukasaataa"]
        self.collection = self.db["projects"]

    def add_preparatory_id(self, he_id, preparatory_id):
        result = self.collection.update_one(
            {"heTunnus": he_id},
            {"$set": {"valmistelutunnus": preparatory_id}},
        )
        return result.modified_count
    
    def add_document(self, document):
        result = self.collection.insert_one(document)
        return result.inserted_id
    
    def document_exists(self, document_id):
        return self.collection.find_one({"id": document_id}) is not None

    def create_search_index(self):
        existing_indexes = self.collection.list_indexes()
        index_exists = any(
            idx["key"]
            == {"heNimi": "text", "heTunnus": "text", "valmistelutunnus": "text"}
            for idx in existing_indexes
        )
        if not index_exists:
            self.collection.create_index(
                [("heNimi", "text"), ("heTunnus", "text"), ("valmistelutunnus", "text")]
            )
            print("Tekstihakemisto luotu.")
        else:
            print("Tekstihakemisto on jo olemassa.")

    def push_document(self, data, he_id, document_type):
        print(he_id)
        result = self.collection.update_one(
            {"heTunnus": he_id}, {"$addToSet": {f"dokumentit.{document_type}": data}}
        )
        return result.modified_count

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
            return count
        except Exception as e:
            print(f"Error in count_documents: {e}")
            return 0
