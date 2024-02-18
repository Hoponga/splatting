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


async function main() {
  await fetch('http://localhost:5000/api/hello')
  .then(response => response.json())
  .then(data => console.log(data));
  //const url = "https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/bonsai/point_cloud/iteration_7000/point_cloud.ply"; // change later 



  //await SPLAT.PLYLoader.LoadAsync(url, scene, (progress) => (progressIndicator.value = progress*100), format); 
  progressDialog.close(); 
  //const filename = "out.splat"; 
  //scene.saveToFile(filename); 

  // Render loop 

  const frame = () => {
    controls.update(); 
    renderer.render(scene, camera); 
    requestAnimationFrame(frame); 

  }
  requestAnimationFrame(frame); 

  let loading = false; 
  const selectFile = async(file : File) => {
    if (loading) return; 
    console.log("Loading!!!!"); 
    loading = true; 
    document.createTextNode("Loading!!!!"); 
    if (file.name.endsWith(".splat")) {
      await SPLAT.Loader.LoadFromFileAsync(file, scene, (progress: number) => {
        progressIndicator.value = progress * 100;
    });
    } else if (file.name.endsWith(".ply")) {
      await SPLAT.PLYLoader.LoadFromFileAsync(
          file,
          scene,
          (progress: number) => {
              progressIndicator.value = progress * 100;
          },
          format,
      );
  }
  scene.saveToFile(file.name.replace(".ply", ".splat"));
  loading = false;
  
};

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

}


main(); 


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
