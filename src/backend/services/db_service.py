from pymongo import MongoClient
from dotenv import load_dotenv
import os

class DBService:
	def __init__(self):
			load_dotenv()
			mongodb_uri=os.getenv("MONGODB_URI")
			if not mongodb_uri:
					raise ValueError("MONGODB_URI is not set in the .env file")
			self.client = MongoClient(mongodb_uri)
			self.db = self.client["test_database_3"]
			self.collection = self.db["test_collection"]

	def fetch_documents(self, page_number, page_size, search_query=""):
			skip_count = (page_number - 1) * page_size
			query = {}

			print(f"QUERY: {search_query}")

			if search_query:
				query = {
						"$or": [
								{"name": {"$regex": search_query, "$options": "i"}},
								{"heIdentifier": {"$regex": search_query, "$options": "i"}},
						]
				}

			print(f"db_service: query: {query}")
			return self.collection.find(query, {"_id": 0}).skip(skip_count).limit(page_size)
