from flask import Flask, jsonify, request
from flask_cors import CORS
import os 
from scp import SCPClient 
import paramiko 

app = Flask(__name__)
CORS(app)

@app.route('/api/hello', methods=['GET'])
def hello():
    print("boop")
    return jsonify({'message': 'hola'})








if __name__ == '__main__':
    app.run(debug=True)

