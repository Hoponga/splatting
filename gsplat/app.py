from flask import Flask, jsonify, request, g
from flask_cors import CORS
import os 
from scp import SCPClient 
import paramiko 
from streaming import StreamingExample 
import olympe 

app = Flask(__name__)
CORS(app, origins = ['http://localhost:5173'])
drone_obj = None
streaming = None

app.config["drone_obj"] = None 
app.config["counter"] = 0
app.config["streaming"] = None 
app.config["DRONE_RTSP_PORT"] = os.environ.get("DRONE_RTSP_PORT")
app.config["DRONE_IP"] = os.environ.get("DRONE_IP", "10.202.0.1")



DRONE_IP = os.environ.get("DRONE_IP", "10.202.0.1")
DRONE_RTSP_PORT = os.environ.get("DRONE_RTSP_PORT")


@app.route('/api/hello', methods=['GET'])
def hello():
    print("boop")
    return jsonify({'message': 'hola'})


@app.route('/api/drone', methods = ['GET'])
def drone(): 
    global DRONE_IP, DRONE_RTSP_PORT
    
    success = jsonify({'message': '1'})
    failure = jsonify({'message': '0'})
    drone_obj = app.config["drone_obj"]

    if drone_obj: 
        print("There is already a drone in the sim! Please wait until the drone is gone")
        return failure 
    
    print("starting drone")

    print(DRONE_IP)
    
    app.config["drone_obj"] = olympe.Drone("10.202.0.1") 
    app.config["counter"] += 1
    app.config["streaming"] = StreamingExample(app.config["drone_obj"])

    if app.config["drone_obj"].connect(): 
        print("successfully connected")
        return success
    else: 
        print("[Drone API] Drone connection failed")
 
    return failure 


@app.route('/api/start_record', methods = ['GET'])
def start_record(): 


    print(f"Starting recording!!!!{app.config['streaming']} {app.config['drone_obj'].connect()} {app.config['DRONE_RTSP_PORT']}")

    success = jsonify({'message': '1'})
    failure = jsonify({'message': '0'})

    # if app.config["streaming"]:
    #     print("Please stop pressing the record button! Recording is already in progress :)")
    #     return failure 
    if not app.config["drone_obj"]: 
        print("There is no drone controller connected to the sim. Do that first")
        return failure 
    
    # app.config["streaming"] = StreamingExample(app.config["drone_obj"])
    app.config["streaming"].start() 
    
    success = jsonify({'message': '1', 'mp4-filepath': app.config["streaming"].video_filepath, 'metadata-filepath': app.config["streaming"].metadata_filepath})
    app.config["streaming"].fly() 

    return success 
    




@app.route('/api/end_record', methods = ['GET'])
def end_record(): 
    global streaming, drone_obj
    print(streaming) 
    print("ending recording!")
    success = jsonify({'message': '1'})
    failure = jsonify({'message': '0'})
    if not streaming or not drone_obj:  
        print("Either no drone exists or a recording was never started before! Start one before trying to end it")
        return failure 
    
    video_filepath = streaming.video_filepath 
    metadata_filepath = streaming.metadata_filepath 

    streaming.stop()

    print(f"Hopefully there is a recording at {video_filepath}")


    success = jsonify({'message': '1', 'video_filepath': video_filepath}) 
    return success 
    


    



    












if __name__ == '__main__':
    app.run(debug=True)

