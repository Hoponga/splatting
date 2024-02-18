from flask import Flask, jsonify, request, session
from flask_cors import CORS
import os 
from scp import SCPClient 
import paramiko 
from streaming import StreamingExample, test_streaming
import olympe 
from utils.upload import upload_to_gcs
import time 
import subprocess 

app = Flask(__name__)
app.secret_key = "super secret key"

CORS(app)

streaming = None
drone = None
upload_filename = None 

@app.route('/api/drone', methods = ['GET'])
def drone():
    global streaming, drone
    # test_streaming() 
    # app.config["drone_obj"] = olympe.Drone("10.202.0.1")

    # app.config["streaming"] = StreamingExample(app.config["drone_obj"]) 
    # app.config["streaming"].start()
    # app.config["streaming"].fly()
    # app.config["streaming"].stop()
    print("0")
    drone = olympe.Drone("10.202.0.1")
    connection = drone.connect()
    print("1")

    return jsonify({'message': connection})


@app.route('/api/start_record', methods = ['GET'])
def start_record(): 
    global streaming
    streaming = StreamingExample(drone)
    # Start the video stream
    print("2")
    streaming.start()
    streaming.fly()
    print("3")

    return jsonify({'message2': True})



@app.route('/api/end_record', methods = ['GET'])
def end_record():
    global streaming, upload_filename
    # Stop the video stream
    print("4")
    streaming.stop()
    print("5")
    
    
    subprocess.run("echo minkydinky | sudo systemctl restart firmwared.service", shell = True)
    upload_filename = streaming.video_filepath
    print("returning from end_record")
    return jsonify({'message': upload_filename})



@app.route('/api/upload', methods = ['GET'])
def upload_file():
    global upload_filename
    BUCKET_NAME = "output-splat-bucket"
    SOURCE_FILE = f"streaming-{hash(time.time())}.mp4"
    SOURCE_FILE_PATH = upload_filename
    DESTINATION_BLOB_NAME = "uploaded-" + SOURCE_FILE
    CREDENTIALS_FILE = "/home/krangana/gaussian_splatting/gsplat/utils/exemplary-fiber-414612-c94072190382.json"
    link = upload_to_gcs(BUCKET_NAME, SOURCE_FILE_PATH, DESTINATION_BLOB_NAME, CREDENTIALS_FILE)

    return jsonify({'filename': DESTINATION_BLOB_NAME})

    



if __name__ == '__main__':
    app.run(threaded = False)

