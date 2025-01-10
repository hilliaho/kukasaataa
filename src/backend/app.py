from flask import Flask, jsonify
from flask_cors import CORS
from services.db_service import DBService

app = Flask(__name__)
CORS(app)

db_service = DBService()

@app.route("/api/projects", methods=["GET"])
def get_data():
    per_page = 10
    page = 1
    try:
        data = db_service.fetch_documents(page, per_page)
        data_list = list(data)
        return jsonify(data_list), 200
    except Exception as e:
        print(f"Error fetching data: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500

if __name__ == "__main__":
    app.run(debug=True)
