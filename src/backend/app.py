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
    print(f"App.py: hakusana: {search_query}")
    try:
        data = db_service.fetch_documents(page, per_page, search_query)
        data_list = list(data)
        return jsonify(data_list), 200
    except Exception as e:
        print(f"Error fetching data: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500

if __name__ == "__main__":
    app.run(debug=True)
