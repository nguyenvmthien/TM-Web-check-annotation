from flask import Flask, jsonify, request, send_from_directory, render_template
import json
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Đường dẫn đến thư mục chứa ảnh và file JSON
IMAGE_FOLDER = "../Part5"
JSON_FILE = "../qa_Part5_2.json"

# Load dữ liệu từ JSON
def load_data():
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

# Lưu dữ liệu vào JSON
def save_data(data):
    with open(JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

# Trang giao diện chính
@app.route("/")
def index():
    return render_template("index.html")

# API lấy danh sách ảnh và câu hỏi
@app.route("/api/images", methods=["GET"])
def get_images():
    data = load_data()
    return jsonify(data)

# ✅ API cập nhật cả câu hỏi, câu trả lời và trạng thái Modified
@app.route("/api/update-qa/<image_id>/<int:qa_index>", methods=["PUT"])
def update_qa(image_id, qa_index):
    data = load_data()

    if image_id in data and 0 <= qa_index < len(data[image_id]):
        new_question = request.json.get("question", None)
        new_answer = request.json.get("answer", None)
        new_modified = request.json.get("modified", False)

        old_question = data[image_id][qa_index]["Question"]
        old_answer = data[image_id][qa_index]["Answer"]

        modified = False

        # Cập nhật câu hỏi nếu có thay đổi
        if new_question is not None and new_question != old_question:
            data[image_id][qa_index]["Question"] = new_question
            modified = True

        # Cập nhật câu trả lời nếu có thay đổi
        if new_answer is not None and new_answer != old_answer:
            data[image_id][qa_index]["Answer"] = new_answer
            modified = True

        # Cập nhật trường Modified từ checkbox
        if new_modified:
            data[image_id][qa_index]["Modified"] = "Yes"
        else:
            data[image_id][qa_index]["Modified"] = "No"

        if modified or new_modified:
            save_data(data)
            return jsonify({"message": "✅ Cập nhật thành công!"})

        return jsonify({"message": "Không có thay đổi nào được thực hiện."})

    return jsonify({"error": "Không tìm thấy dữ liệu!"}), 404

# API phục vụ hình ảnh
@app.route("/images/<filename>")
def get_image(filename):
    return send_from_directory(IMAGE_FOLDER, filename)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
