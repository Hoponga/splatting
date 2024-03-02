# SkySplat

## Treehacks 2024 Winner - Sustainability Grand Prize! 🎉
## Drones + Gaussian Splatting = Automated, AI-Powered 3D Modeling of Any Environment for Disaster Recovery, Emergency Response, and Infrastructure Inspections

By Anirudh Kotamraju, Kailash Ranganathan, Arjun Dixit, and Sasvath Ramachandran

### Inspiration
In 2010, Haiti faced a magnitude 7.0 earthquake, which remains to this day one of the most devastating natural disasters of our century. An estimated 220,000 individuals lost their lives, with an additional 1.5 million losing their homes. At the center of the tragedy was poor building construction, practices, and materials. More than 208,000 buildings were damaged, half of which were fully destroyed, severely crippling the nation’s infrastructure. Two questions stuck out to us: How could 3D models have been used to gauge the degree of damage, stability, and safety of infrastructure? If a natural disaster occurred today, how could an improved understanding of building layouts help first responders provide aid more quickly?

One of our main goals was to utilize state of the art technology with a potential for powerful impact. Drawing from some of our members’ past work with Neural Radiance Fields (NeRFs) and other generative CV techniques, we wanted to help solve these questions by fusing drones and AI.

### What it does
Introducing SkySplat, an AI-powered drone software to perform automated 3D captures of any building or infrastructure asset. Here are some sample applications: Helping first responders deeply understand the layouts of crippled buildings before performing emergency response. Empowering governments to maintain detailed 3D models of infrastructure without the need of specialized mapping equipment. Enabling technicians to perform inspections on structures that would be impossible to reach without extensive equipment and risk of personal injury. Allowing property owners to provide 3D models of properties for customers to explore at their own convenience.

Currently, we are focused on the Parrot drone suite. Our software seamlessly connects to your drone based on your IP. In our web app, you can decide when to begin and complete your data recording session. Immediately upon finishing the data collection, a video is automatically sent to our Google Cloud backend for preprocessing. The video is split into a set frames, optimizing for both efficiency and accuracy, which is then passed into our COLMAP pipeline. Once COLMAP completes, our software automatically trains the Gaussian Splatting models, uploads the results into a Google Cloud bucket, which is then forwarded to our frontend. Finally, a user can effortlessly view their model in high resolution 3D from our webapp.

### How we built it
For our frontend and splatting visualization, we used Vite, Typescript, and three.js (a wrapper on top of WebGL). Additionally, we used CSS for styling.

As some context, the Gaussian Splatting models cannot directly take in video streams. We have to preprocess them using COLMAP, a software that intelligently figures out the relative position of each frame in 3D space (known as a structure from motion point cloud computation). After optimizing the COLMAP parameters, we moved onto the training of our Gaussian Splatting models.

Due to the intensive nature of Gaussian Splatting models, we set up virtual machines on Google Cloud with CUDA-accelerated runtimes. Due to our lack of budget, we were highly limited in the number of and models of GPUs we could use. The custom models themselves are based in PyTorch, derived from the paper 3D Gaussian Splatting for Real-Time Radiance Field Rendering. Each scene has its own model, ensuring a highly specialized understanding of spatial relations.

Finally, we used third-party open-source libraries (shout-out to gsplat.js & HuggingFace!) to efficiently render our .ply point-clouds into WebGL textures (3D -> 2D projection) to visualize on our webapp without exorbitant amounts of compute.

Across the stack, we used Google Cloud buckets to store models, renders, and video files.

### Challenges we ran into
Difficulties we ran into were primarily related to the usage of the Olympe SDK for the simulation and drone movement and SuGaR (Surface-Aligned Gaussian Splatting for Efficient 3D Mesh Reconstruction and High-Quality Mesh Rendering) for the fine tuning of the mesh.

While using the Olympe SDK, it was difficult to build our complete pipeline which started from a video taken of the drone’s movements in Olympe (which also required using Ubuntu, which came with its own limitations) since Olympe had very specific requirements with regards to threading and lack thereof to produce a working drone simulation with movement.

For SuGaR, we dealt with long training times and diminishing marginal returns on the improvement in visualization of point clouds. For example, it took multiple hours to produce a more refined mesh and optimize given a 40-second video as input, and the produced output was only slightly better than what we had produced without using SuGaR.

Fundamentally, beyond these two specific cases, it was a difficult learning curve to understand how Gaussian Splatting works mathematically, and why it can be considered today’s cutting-edge software for 3D-Renders built from video inputs. Gaussian Splatting as a concept becomes very math-heavy, but we were able to eventually identify the most useful distinguishing features and the salient similarities it shares with other more familiar tools we’ve worked with before, such as NeRFs (Neural Radiance Fields).

### Accomplishments that we're proud of
We’re very proud of being able to utilize a technique that’s very cutting-edge and mostly only known to research communities in an applicable & impactful setting such as drone view reconstruction. We were also very proud to be able to do so with minimal compute resources, given that Gaussian splatting models are known to need very heavy amounts of GPU acceleration for good results (the entirety of our 3D reconstructions were done using cloud T4 GPUs on free Google Cloud credits). To get good models from this approach, we had to get a better understanding of hyperparameter tuning & also what entails good data collection in terms of video-taking.

Given that our project also combined many diverse moving parts (from GCS buckets to WebGL frontend), we were very proud that we were able to string everything together and get a working pipeline in such a short time!

### What we learned
We learned a lot about modern computer vision research through looking at models like NERFs and Gaussian splatting (as well as optimizations to Gaussian splatting such as SuGaR). We learned a lot about computer vision algorithms such as structure from motion and multiview geometry. On the other hand, we learned quite a bit about the software that goes behind operating drones through Parrot’s SDK, Sphinx, and Olympe. All in all, we also learned a lot about software development and learning how to merge many different frameworks into one application!

### What's next for SkySplat
We hope to get a better understanding of how parameters can be tuned based on what kind of video-type we’re trying to map, since the optimization of parameters (such as our loss function, number of iterations, and frame rate decomposition from videos into image sets) makes a large difference in the quality of our renders. Additionally, we hope to look more into how parallel computing can help us take advantage of the fine-surface meshes that SuGaR can produce.

Pictures don’t tell the full story. Our 3D models are lightweight, explorable, and powerful. Whenever you want to freeze a moment in time, SkySplat has you covered!
