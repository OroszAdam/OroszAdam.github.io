import * as THREE from "three";
import { Color, MeshPhongMaterial } from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";

import Experience from "../Experience.js";

export default class Floor {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.renderer = this.experience.renderer;
    this.camera = this.experience.camera;
    this.scene = this.experience.scene;
    this.light = this.experience.world.environment.sunLight;
    this.resources = this.experience.resources;
    this.setFloor(this.experience.canvas, this.renderer, this.camera);

    console.log("constructor", this.renderer);
  }
  setFloor(canvas, renderer, camera) {
    function loadFile(filename) {
      return new Promise((resolve, reject) => {
        const loader = new THREE.FileLoader();

        loader.load(filename, (data) => {
          resolve(data);
        });
      });
    }
    loadFile("Experience/Shaders/utils.glsl").then((utils) => {
      THREE.ShaderChunk["utils"] = utils;
      const light = [
        0.7559289460184544, 0.7559289460184544, -0.3779644730092272,
      ];

      // // Create mouse Controls
      // this.controls = new TrackballControls(this.camera, this.renderer.canvas);

      // this.controls.screen.width = width;
      // this.controls.screen.height = height;

      // this.controls.rotateSpeed = 2.5;
      // this.controls.zoomSpeed = 1.2;
      // this.controls.panSpeed = 0.9;
      // this.controls.dynamicDampingFactor = 0.9;

      // Ray caster
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      const targetGeometry = new THREE.PlaneGeometry(2, 2);
      // for (let vertex of targetGeometry.vertices) {
      //   vertex.z = -vertex.y;
      //   vertex.y = 0;
      // }
      const targetmesh = new THREE.Mesh(targetGeometry);

      // Textures
      // const cubetextureloader = new THREE.CubeTextureLoader();

      // const textureCube = cubetextureloader.load([
      //   "xpos.jpg",
      //   "xneg.jpg",
      //   "ypos.jpg",
      //   "ypos.jpg",
      //   "zpos.jpg",
      //   "zneg.jpg",
      // ]);

      const textureloader = new THREE.TextureLoader();

      const tiles = textureloader.load("../public/textures/tiles.jpg");

      class WaterSimulation {
        constructor() {
          this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 2000);

          this._geometry = new THREE.PlaneGeometry(2, 2);

          this._textureA = new THREE.WebGLRenderTarget(256, 256, {
            type: THREE.FloatType,
          });
          this._textureB = new THREE.WebGLRenderTarget(256, 256, {
            type: THREE.FloatType,
          });
          this.texture = this._textureA;

          const shadersPromises = [
            loadFile("Experience/Shaders/simulation/vertex.glsl"),
            loadFile("Experience/Shaders/simulation/drop_fragment.glsl"),
            loadFile("Experience/Shaders/simulation/normal_fragment.glsl"),
            loadFile("Experience/Shaders/simulation/update_fragment.glsl"),
          ];

          this.loaded = Promise.all(shadersPromises).then(
            ([
              vertexShader,
              dropFragmentShader,
              normalFragmentShader,
              updateFragmentShader,
            ]) => {
              const dropMaterial = new THREE.RawShaderMaterial({
                uniforms: {
                  center: { value: [0, 0] },
                  radius: { value: 0 },
                  strength: { value: 0 },
                  texture: { value: null },
                },
                vertexShader: vertexShader,
                fragmentShader: dropFragmentShader,
              });

              const normalMaterial = new THREE.RawShaderMaterial({
                uniforms: {
                  delta: { value: [1 / 256, 1 / 256] }, // TODO: Remove this useless uniform and hardcode it in shaders?
                  texture: { value: null },
                },
                vertexShader: vertexShader,
                fragmentShader: normalFragmentShader,
              });

              const updateMaterial = new THREE.RawShaderMaterial({
                uniforms: {
                  delta: { value: [1 / 256, 1 / 256] }, // TODO: Remove this useless uniform and hardcode it in shaders?
                  texture: { value: null },
                },
                vertexShader: vertexShader,
                fragmentShader: updateFragmentShader,
              });

              this._dropMesh = new THREE.Mesh(this._geometry, dropMaterial);
              this._normalMesh = new THREE.Mesh(this._geometry, normalMaterial);
              this._updateMesh = new THREE.Mesh(this._geometry, updateMaterial);
            }
          );
        }

        // Add a drop of water at the (x, y) coordinate (in the range [-1, 1])
        addDrop(renderer, x, y, radius, strength) {
          this._dropMesh.material.uniforms["center"].value = [x, y];
          this._dropMesh.material.uniforms["radius"].value = radius;
          this._dropMesh.material.uniforms["strength"].value = strength;

          this._render(renderer, this._dropMesh);
        }

        stepSimulation(renderer) {
          this._render(renderer, this._updateMesh);
        }

        updateNormals(renderer) {
          this._render(renderer, this._normalMesh);
        }

        _render(renderer, mesh) {
          // Swap textures
          const oldTexture = this.texture;
          const newTexture =
            this.texture === this._textureA ? this._textureB : this._textureA;

          mesh.material.uniforms["texture"].value = oldTexture.texture;

          // renderer.setRenderTarget(newTexture);

          // TODO Camera is useless here, what should be done?
          // renderer.render(mesh, this._camera);

          this.texture = newTexture;
        }
      }

      class Water {
        constructor() {
          this.geometry = new THREE.PlaneBufferGeometry(2, 2, 200, 200);

          const shadersPromises = [
            loadFile("Experience/Shaders/water/vertex.glsl"),
            loadFile("Experience/Shaders/water/fragment.glsl"),
          ];

          this.loaded = Promise.all(shadersPromises).then(
            ([vertexShader, fragmentShader]) => {
              this.material = new THREE.RawShaderMaterial({
                uniforms: {
                  light: { value: light },
                  tiles: { value: tiles },
                  // sky: { value: textureCube },
                  water: { value: null },
                  causticTex: { value: null },
                  underwater: { value: false },
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
              });

              this.mesh = new THREE.Mesh(this.geometry, this.material);
            }
          );
        }

        draw(renderer, waterTexture, causticsTexture) {
          this.material.uniforms["water"].value = waterTexture;
          this.material.uniforms["causticTex"].value = causticsTexture;

          this.material.side = THREE.FrontSide;
          this.material.uniforms["underwater"].value = true;
          // renderer.render(this.mesh, camera);

          this.material.side = THREE.BackSide;
          this.material.uniforms["underwater"].value = false;
          // renderer.render(this.mesh, camera);
        }
      }

      const waterSimulation = new WaterSimulation();
      const water = new Water();

      // Main rendering loop
      function animate() {
        waterSimulation.stepSimulation(renderer);
        waterSimulation.updateNormals(renderer);

        const waterTexture = waterSimulation.texture.texture;

        // debug.draw(renderer, causticsTexture);
        // renderer.setRenderTarget(null);
        // renderer.setClearColor("0xffffff", 1);
        // renderer.clear();

        water.draw(renderer, waterTexture);

        // controls.update();

        window.requestAnimationFrame(animate);
      }

      function onMouseMove(event) {
        const rect = canvas.getBoundingClientRect();

        mouse.x = ((event.clientX - rect.left) * 2) / width - 1;
        mouse.y = (-(event.clientY - rect.top) * 2) / height + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(targetmesh);

        for (let intersect of intersects) {
          waterSimulation.addDrop(
            renderer,
            intersect.point.x,
            intersect.point.z,
            0.03,
            0.04
          );
        }
      }

      const loaded = [waterSimulation.loaded, water.loaded];

      Promise.all(loaded).then(() => {
        canvas.addEventListener("mousemove", { handleEvent: onMouseMove });

        for (var i = 0; i < 20; i++) {
          waterSimulation.addDrop(
            renderer,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            0.03,
            i & 1 ? 0.02 : -0.02
          );
        }

        animate();
      });
    });
  }
  resize() {}
  update() {}
}
