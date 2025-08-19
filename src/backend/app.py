from flask import Flask, jsonify, request
from flask_cors import CORS
from services.db_service import DBService
from services.selection_db_service import SelectionDbService

app = Flask(__name__)
CORS(app)

db_service = DBService()
selection_db_service = SelectionDbService()

@app.route("/projects", methods=["GET"])
def get_data():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 1))
    search_query = request.args.get("search_query", "")
    try:
        data = db_service.fetch_documents(page, per_page, search_query)
        return jsonify(data), 200
    except Exception as e:
        print(f"Error fetching data: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500
    
@app.route("/projects/count", methods=["GET"])
def get_result_count():
    search_query = request.args.get("search_query", "")
    try:
        total_count = db_service.count_documents(search_query)
        print("app.py total count:", total_count)
        return jsonify({"count": total_count}), 200
    except Exception as e:
        return jsonify({"error": "Failed to get results count"}), 500
    
@app.route("/selections", methods=["GET"])
def get_selection_data():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 1))
    search_query = request.args.get("search_query", "")
    try:
        data = selection_db_service.fetch_documents(page, per_page, search_query)
        return jsonify(data), 200
    except Exception as e:
        print(f"Error fetching data: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500
    
@app.route("/selections/join/<code>", methods=["GET"])
def get_selection_by_joincode(code):
    try:
        selection = selection_db_service.find_by_joincode(code)
        if selection:
            return jsonify(selection), 200
        else:
            return jsonify({"error": "Selection not found"}), 404
    except Exception as e:
        print(f"Error fetching selection by code: {e}")
        return jsonify({"error": "Failed to fetch selection"}), 500
    
@app.route("/selections/edit/<code>", methods=["GET"])
def get_selection_by_editcode(code):
    try:
        selection = selection_db_service.find_by_editcode(code)
        if selection:
            return jsonify(selection), 200
        else:
            return jsonify({"error": "Selection not found"}), 404
    except Exception as e:
        print(f"Error fetching selection by code: {e}")
        return jsonify({"error": "Failed to fetch selection"}), 500
    
@app.route("/selections", methods=["POST"])
def create_selection():
    data = request.json
    try:
        selection_db_service.create_selection(data)
        return jsonify({"message": "Selection created successfully"}), 201
    except Exception as e:
        print(f"Error creating selection: {e}")
        return jsonify({"error": "Failed to create selection"}), 500
    

if __name__ == "__main__":
    app.run(debug=True)


