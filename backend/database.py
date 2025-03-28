from pymongo import MongoClient
from config import Config

client = MongoClient(Config.MONGO_URI)
db = client["legal_ai_db"]  # Database name
documents_collection = db["documents"]  # Collection for storing legal docs
