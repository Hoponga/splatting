import './style.css';
import * as SPLAT from "gsplat"; 


addEventListener("DOMContentLoaded", (_) => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const progressDialog = document.getElementById("progress-dialog") as HTMLDialogElement;
  const progressIndicator = document.getElementById("progress-indicator") as HTMLProgressElement;


  const scene = new SPLAT.Scene(); 
  const camera = new SPLAT.Camera(); 
  const renderer = new SPLAT.WebGLRenderer(canvas); 
  const controls = new SPLAT.OrbitControls(camera, canvas);
  const format = "polycam"; 
  let loading = false;

  const selectFile = async(file : File) => {
    if (loading) return; 
    console.log("Loading!!!!"); 
    loading = true; 
    document.createTextNode("Loading!!!!"); 
    if (file.name.endsWith(".splat")) {
      await SPLAT.Loader.LoadFromFileAsync(file, scene, (progress: number) => {
        console.log(progress);
    });
    } else if (file.name.endsWith(".ply")) {
      await SPLAT.PLYLoader.LoadFromFileAsync(
          file,
          scene,
          (progress: number) => {
              console.log(progress); 
          },
          format,
      );
    }
    scene.saveToFile(file.name.replace(".ply", ".splat"));
    progressDialog.close(); 
    loading = false;
  };


  const toggleCanvasDisplay = () => {
    canvas.style.display = canvas.style.display === "none" ? "block" : "none";
  }

  const toggleOtherDisplay = () => {
    const other = document.getElementById("other") as HTMLDivElement;
    other.style.display = other.style.display === "none" ? "block" : "none";
  }

  const toggleActivateBtnDisplay = () => {
    const other = document.getElementById("connect-btn") as HTMLDivElement;
    other.style.display = other.style.display === "none" ? "flex" : "none";
  }
  const toggleRecordBtnDisplay = () => {
    const other = document.getElementById("record-btn") as HTMLDivElement;
    other.style.display = other.style.display === "none" ? "flex" : "none";
  }

  const toggleStopRecordBtnDisplay = () => {
    const other = document.getElementById("end-record-btn") as HTMLDivElement;
    other.style.display = other.style.display === "none" ? "flex" : "none";
  }

  const toggleConnectionLoading = () => {
    const other = document.getElementById("connection-loading") as HTMLDivElement;
    other.style.display = other.style.display === "none" ? "block" : "none";

    const connect_btn = document.getElementById("connect-btn") as HTMLDivElement;

    connect_btn.setAttribute("disabled", connect_btn.getAttribute("disabled") === "true" ? "false" : "true");
  }

  const toggleRecordLoading = () => {
    const other = document.getElementById("record-loading") as HTMLDivElement;
    other.style.display = other.style.display === "none" ? "block" : "none";

    const record_btn = document.getElementById("record-btn") as HTMLDivElement;

    record_btn.setAttribute("disabled", record_btn.getAttribute("disabled") === "true" ? "false" : "true");
  }

  // const toggleIsRecording = () => {
  //   const other = document.getElementById("is-recording") as HTMLDivElement;
  //   const recording_btn = document.getElementById("record-btn") as HTMLDivElement; 
  //   other.style.display = other.style.display === "none" ? "block" : "none";

  //   // increase the right padding by 30px
  //   // recording_btn.style.paddingRight = "40px";
  //   recording_btn.innerHTML = "Recording...";
  // }

  const toggleFinalLoading = () => {
    const other = document.getElementById("final-loading") as HTMLDivElement;
    other.style.display = other.style.display === "none" ? "block" : "none";
  }

  const loadSplatURL = async(url : string) => {
    if (loading) return; 
    console.log("Loading!!!!"); 
    loading = true; 
    document.createTextNode("Loading!!!!"); 
    if (url.includes(".splat")) {
      await SPLAT.Loader.LoadAsync(url, scene, () => {});
    } else {
      console.log("Ply file is being loaded to scene"); 
      await SPLAT.PLYLoader.LoadAsync(url, scene, (progress: number) => {console.log(progress)});
    }
    //scene.saveToFile(file.name.replace(".ply", ".splat"));
    toggleFinalLoading();
    toggleCanvasDisplay();
    // toggleOtherDisplay();
    progressDialog.close();
    loading = false;
  };

  progressDialog.close(); 
  const frame = () => {
    controls.update(); 
    renderer.render(scene, camera); 
    requestAnimationFrame(frame); 

  }
  requestAnimationFrame(frame); 

  document.getElementById('connect-btn')?.addEventListener("click", async () => {
    toggleConnectionLoading();
    let res1 = await fetch('http://localhost:5000/api/drone')
    let res1_json = await res1.json(); 


    // setTimeout(() => {
    toggleActivateBtnDisplay();
    toggleRecordBtnDisplay();
    toggleConnectionLoading();
    // }, 1000);

    console.log(res1_json); 
  })

  document.getElementById('record-btn')?.addEventListener("click", async () => {
    toggleRecordLoading();
    let res2 = await fetch('http://localhost:5000/api/start_record');
    let res2_json = await res2.json();
    // setTimeout(() => {
    toggleRecordLoading();
    console.log(res2_json); 
      // toggleIsRecording();
    toggleRecordBtnDisplay();
    toggleStopRecordBtnDisplay();
    // }, 1000);
  })


  document.getElementById('end-record-btn')?.addEventListener("click", async () => {
    try {
      await fetch('http://localhost:5000/api/end_record');
    }
    finally {
      // toggleRecordBtnDisplay();
      toggleStopRecordBtnDisplay();
      // toggleRecordLoading();
      toggleFinalLoading();

      
      setTimeout(async () => {
        let res4 = await fetch('http://localhost:5000/api/upload'); 
        let res4_json = await res4.json(); 
        let video_filename = res4_json.filename; 

        console.log(video_filename); 

        let vid_res = await fetch('http://34.16.161.22:5000/process-video', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({"filename": video_filename})
        }); 
        let vid_res_json = await vid_res.json(); 
        //https://storage.googleapis.com/download/storage/v1/b/output-splat-bucket/o/uploaded-uploaded-streaming-244825507086081748.ply?generation=1708269482359716&alt=media
        //let ply_url = "https://storage.googleapis.com/download/storage/v1/b/output-splat-bucket/o/uploaded-uploaded-streaming-244825507086081748.ply?generation=1708269482359716&alt=media"; 

        let ply_url = vid_res_json.ply_url;
        
        loadSplatURL(ply_url);
      }, 10000);
    }
  })

  document.addEventListener("dragover", function(event) {
    event.preventDefault();
  });

  document.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer != null && e.dataTransfer.files.length > 0) {
        selectFile(e.dataTransfer.files[0]);
    }
  });
});


// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//   <div>
//     <a href="https://vitejs.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://www.typescriptlang.org/" target="_blank">
//       <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
//     </a>
//     <h1>Vite + TypeScript</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite and TypeScript logos to learn more
//     </p>
//   </div>
// `

// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)






  // console.log("sending drone...")

  // let res1 = await fetch('http://localhost:5000/api/drone')
  // let res1_json = await res1.json()


  // console.log(res1_json['success'])
  // console.log("sending start_record...")

  // if (res1_json.message > 0) {
  //   let res2 = await fetch('http://localhost:5000/api/start_record');
  //   let res2_json = await res2.json(); 



  //   console.log(res2_json); 

  //   if (res2_json.message > 0) {
  //     console.log("sending end_record...")
  //     let res3 = await fetch('http://localhost:5000/api/end_record');
  //     let res3_json = await res3.json()

  //     console.log(res3_json)

  //   }
    

    

  // }
  
  
  // fetch('http://localhost:5000/api/drone').then(response => response.json()).then(data => {
  //   console.log(data); 
  //   setTimeout( () => {if (data.message) {
  //     fetch('http://localhost:5000/api/start_record').then(
  //     response => response.json()
  //     ).then(data => {
  //       console.log(data); 
  //       if (data.message) {
  //         setTimeout(() => {
  //           fetch('http://localhost:5000/api/end_record')
  //           .then(response => response.json())
  //           .then(data => {video_filename = data.message;});
  //         }, 2000); 
  //       }
  //     }); 
  //   }}, 10); 
  // }); 

  
  


  // await fetch('http://localhost:5000/api/hello')
  // .then(response => response.json())
  // .then(data => console.log(data));
  //const url = "https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/bonsai/point_cloud/iteration_7000/point_cloud.ply"; // change later 

  //await SPLAT.PLYLoader.LoadAsync(url, scene, (progress) => (progressIndicator.value = progress*100), format); 
  
  //const filename = "out.splat"; 
  //scene.saveToFile(filename); 

  // Render loop 