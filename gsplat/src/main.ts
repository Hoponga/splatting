import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'
import * as SPLAT from "gsplat"; 
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const progressDialog = document.getElementById("progress-dialog") as HTMLDialogElement;
const progressIndicator = document.getElementById("progress-indicator") as HTMLProgressElement;


const scene = new SPLAT.Scene(); 
const camera = new SPLAT.Camera(); 
const renderer = new SPLAT.WebGLRenderer(); 
const controls = new SPLAT.OrbitControls(camera, renderer.canvas);
const format = "polycam"; 
let flag1 = false; 
let flag2 = false; 
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
  progressDialog.close();
  loading = false;
};


async function main() {
  progressDialog.close(); 
  const frame = () => {
    controls.update(); 
    renderer.render(scene, camera); 
    requestAnimationFrame(frame); 

  }
  requestAnimationFrame(frame); 

}


addEventListener("DOMContentLoaded", (e) => {
  


  

  document.getElementById('connect-btn')?.addEventListener("click", async () => {
    let res1 = await fetch('http://localhost:5000/api/drone')
    let res1_json = await res1.json(); 

    console.log(res1_json); 

    flag1 = res1_json['message'];
  })

  document.getElementById('record-btn')?.addEventListener("click", async () => {
    let res2 = await fetch('http://localhost:5000/api/start_record');

    
    let res2_json = await res2.json();
    console.log(res2_json); 
  })


  document.getElementById('end-record-btn')?.addEventListener("click", async () => {
    try {
      let res3 = await fetch('http://localhost:5000/api/end_record');
      //let x = 1;
    }
    finally {
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
        console.log(ply_url); 
        loadSplatURL(ply_url);

        // let poll = setInterval(() => {
        //   fetch(ply_url).then((ply_file) => {
        //     console.log()
        //     clearInterval(poll);
        //     ply_file.blob().then((ply_blob) => {
        //       selectFile(new File([ply_blob], "dummy.ply"));
        //     });
        //   })
        // }, 1000);
      }, 10000);
    }
  })
});


main(); 

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