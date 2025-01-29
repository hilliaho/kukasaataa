from flask import Flask, jsonify, request
from flask_cors import CORS
from services.db_service import DBService

app = Flask(__name__)
CORS(app)

db_service = DBService()

@app.route("/api/projects", methods=["GET"])
def get_data():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    search_query = request.args.get("search_query", "")
    try:
        data = db_service.fetch_documents(page, per_page, search_query)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch data"}), 500
    
@app.route("/api/projects/count", methods=["GET"])
def get_result_count():
    search_query = request.args.get("search_query", "")
    try:
      total_count = db_service.count_documents(search_query)
      print("app.py total count:", total_count)
      return jsonify({"count": total_count}), 200
    except Exception as e:
      return jsonify({"error": "Failed to get results count"}), 500

if __name__ == "__main__":
  app.run(debug=True)
