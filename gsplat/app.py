from flask import Flask, jsonify, request
from flask_cors import CORS
import os 
from scp import SCPClient 
import paramiko 
from streaming import StreamingExample 
import olympe 

app = Flask(__name__)
CORS(app)
drone_obj = None 
streaming = None 

@app.route('/api/hello', methods=['GET'])
def hello():
    print("boop")
    return jsonify({'message': 'hola'})


@app.route('/api/drone', methods = ['GET'])
def drone(): 
    
    global drone_obj
    print(drone_obj)
    success = jsonify({'message': '1'})
    failure = jsonify({'message': '0'})

    if drone_obj: 
        print("There is already a drone in the sim! Please wait until the drone is gone")
        return failure 
    
    print("starting drone")
    DRONE_IP = os.environ.get("DRONE_IP", "10.202.0.1")
    DRONE_RTSP_PORT = os.environ.get("DRONE_RTSP_PORT")
    drone_obj = olympe.Drone(DRONE_IP) 

    if drone_obj.connect(): 
        return success
 
    return failure 


@app.route('/api/start_record', methods = ['GET'])
def start_record(): 
    global streaming, drone_obj

    print(f"Starting recording!!!!{streaming} {drone_obj.connect()}")

    success = jsonify({'message': '1'})
    failure = jsonify({'message': '0'})

    if streaming:
        print("Please stop pressing the record button! Recording is already in progress :)")
        return failure 
    elif not drone_obj: 
        print("There is no drone controller connected to the sim. Do that first")
        return failure 
    
    streaming = StreamingExample(drone_obj)
    streaming.start() 
    
    success = jsonify({'message': '1', 'mp4-filepath': streaming.video_filepath, 'metadata-filepath': streaming.metadata_filepath})
    streaming.fly() 

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

