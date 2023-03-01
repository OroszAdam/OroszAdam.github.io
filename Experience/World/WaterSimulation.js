// import * as THREE from "three";

// import { loadFile } from "./functions";

// export default class WaterSimulation {
//   constructor(camera, renderer, _geometry) {
//     this.camera = camera;
//     this.renderer = renderer;
//     this._geometry = _geometry;

//     this._textureA = new THREE.WebGLRenderTarget(256, 256, {
//       type: THREE.FloatType,
//     });
//     this._textureB = new THREE.WebGLRenderTarget(256, 256, {
//       type: THREE.FloatType,
//     });
//     this.texture = this._textureA;

//     const shadersPromises = [
//       loadFile("Experience/Shaders/simulation/vertex.glsl"),
//       loadFile("Experience/Shaders/simulation/drop_fragment.glsl"),
//       loadFile("Experience/Shaders/simulation/normal_fragment.glsl"),
//       loadFile("Experience/Shaders/simulation/update_fragment.glsl"),
//     ];

//     this.loaded = Promise.all(shadersPromises).then(
//       ([
//         vertexShader,
//         dropFragmentShader,
//         normalFragmentShader,
//         updateFragmentShader,
//       ]) => {
//         const dropMaterial = new THREE.RawShaderMaterial({
//           uniforms: {
//             center: { value: [0, 0] },
//             radius: { value: 0 },
//             strength: { value: 0 },
//             texture: { value: null },
//           },
//           vertexShader: vertexShader,
//           fragmentShader: dropFragmentShader,
//         });

//         const normalMaterial = new THREE.RawShaderMaterial({
//           uniforms: {
//             delta: { value: [1 / 256, 1 / 256] }, // TODO: Remove this useless uniform and hardcode it in shaders?
//             texture: { value: null },
//           },
//           vertexShader: vertexShader,
//           fragmentShader: normalFragmentShader,
//         });

//         const updateMaterial = new THREE.RawShaderMaterial({
//           uniforms: {
//             delta: { value: [1 / 256, 1 / 256] }, // TODO: Remove this useless uniform and hardcode it in shaders?
//             texture: { value: null },
//           },
//           vertexShader: vertexShader,
//           fragmentShader: updateFragmentShader,
//         });

//         this._dropMesh = new THREE.Mesh(this._geometry, dropMaterial);
//         this._normalMesh = new THREE.Mesh(this._geometry, normalMaterial);
//         this._updateMesh = new THREE.Mesh(this._geometry, updateMaterial);
//       }
//     );
//   }

//   // Add a drop of water at the (x, y) coordinate (in the range [-1, 1])
//   addDrop(x, y, radius, strength) {
//     this._dropMesh.material.uniforms["center"].value = [x, y];
//     this._dropMesh.material.uniforms["radius"].value = radius;
//     this._dropMesh.material.uniforms["strength"].value = strength;
//     this._render(this._dropMesh);
//   }

//   stepSimulation() {
//     this._render(this._updateMesh);
//   }

//   updateNormals() {
//     this._render(this._normalMesh);
//   }

//   _render(mesh) {
//     // Swap textures
//     const oldTexture = this.texture;
//     const newTexture =
//       this.texture === this._textureA ? this._textureB : this._textureA;

//     mesh.material.uniforms["texture"].value = oldTexture.texture;

//     this.renderer.renderer.setRenderTarget(newTexture);
//     // TODO Camera is useless here, what should be done?
//     this.renderer.renderer.render(mesh, this.camera);

//     this.texture = newTexture;
//   }
// }
