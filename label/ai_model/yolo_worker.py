from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    fake_results = [
        {
            "labelName": "Person",
            "xcenter": 0.5,
            "ycenter": 0.5,
            "width": 0.2,
            "height": 0.4,
            "confidence": 0.99
        }
    ]
    print(">>> Java đã gọi! Đang gửi tọa độ ")
    return jsonify({"result": fake_results})

if __name__ == '__main__':
    # Chạy ở cổng 8000
    app.run(host='0.0.0.0', port=8000)