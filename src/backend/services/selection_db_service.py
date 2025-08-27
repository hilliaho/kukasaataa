from pymongo import MongoClient
from dotenv import load_dotenv
import os

class SelectionDbService:
	_client = None

	def __init__(self):
		if not SelectionDbService._client:
			load_dotenv()
			mongodb_uri = os.getenv("MONGODB_URI")
			if not mongodb_uri:
				raise ValueError("MONGODB_URI is not set in the .env file")
			SelectionDbService._client = MongoClient(mongodb_uri)

		self.db = SelectionDbService._client["kukasaataa"]
		self.collection = self.db["selections"]

	def create_selection(self, data):
		"""Tallenna valikoima dokumentteja koodilla"""
		self.collection.replace_one({"editCode": data["editCode"]}, data, upsert=True)

	def find_by_joincode(self, code: str):
		"""Hae valikoima annetulla koodilla"""
		result = self.collection.find_one({"joinCode": code})
		if result:
			result["_id"] = str(result["_id"])
		return result

	def find_by_editcode(self, code: str):
		"""Hae valikoima annetulla koodilla"""
		result = self.collection.find_one({"editCode": code})
		if result:
			result["_id"] = str(result["_id"])
		return result

