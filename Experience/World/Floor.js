import * as THREE from "three";
import { Color, MeshPhongMaterial } from "three";

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
    this.setFloor();
    const textureloader = new THREE.TextureLoader();

    this.tiles = textureloader.load("/public/textures/tiles.jpg");
    this.waterSimulation = new WaterSimulation();
    this.water = new Water();
    this.animate();
  }
  setFloor() {
    // const waterNormals = new THREE.TextureLoader().load(
    //   "/textures/waternormals.jpg",
    //   function (texture) {
    //     texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    //   }
    // );
    // water = new THREE.Water(this.renderer, this.camera, this.scene, {
    //   textureWidth: 512,
    //   textureHeight: 512,
    //   waterNormals: waterNormals,
    //   alpha: 1.0,
    //   sunDirection: this.light.position.clone().normalize(),
    //   sunColor: 0xffffff,
    //   waterColor: 0x001e0f,
    //   distortionScale: 50.0,
    // });
    // mirrorMesh = new THREE.Mesh(
    //   new THREE.PlaneBufferGeometry(
    //     parameters.width * 500,
    //     parameters.height * 500
    //   ),
    //   water.material
    // );
    // mirrorMesh.add(water);
    // mirrorMesh.rotation.x = -Math.PI * 0.5;
    // scene.add(mirrorMesh);
    // this.waterGeometry = new THREE.PlaneBufferGeometry(2, 2, 200, 200);
    // this.waterMaterial = new THREE.RawShaderMaterial({
    //   uniforms: {
    //     light: { value: this.light },
    //     tiles: { value: tiles },
    //     // sky: { value: textureCube },
    //     water: { value: null },
    //     causticTex: { value: null },
    //     underwater: { value: false },
    //   },
    //   vertexShader: waterVertexShader,
    //   fragmentShader: waterFragmentShader,
    // });
    // this.water = new THREE.Mesh(this.waterGeometry, this.waterMaterial);
    // this.water.rotation.x = -Math.PI / 2;
    // this.water.position.y = -1;
    // this.scene.add(this.water);
    // this.plane.position.y = -0.7;
    // this.plane.receiveShadow = true;
  }
  resize() {}
  update() {}
  animate() {
    console.log(this.renderer);

    this.waterSimulation.stepSimulation(this.renderer);
    this.waterSimulation.updateNormals(this.renderer);

    const waterTexture = this.waterSimulation.texture.texture;
    // debug.draw(renderer, causticsTexture);

    this.renderer.setRenderTarget(null);
    this.renderer.setClearColor(white, 1);
    this.renderer.clear();

    water.draw(renderer, waterTexture);

    controls.update();

    window.requestAnimationFrame(animate);
  }
  onMouseMove(event) {
    const rect = this.experience.canvas.getBoundingClientRect();

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
}
function loadFile(filename) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.FileLoader();

    loader.load(filename, (data) => {
      resolve(data);
    });
  });
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
            light: { value: this.light },
            tiles: { value: this.tiles },
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
    renderer.render(this.mesh, camera);

    this.material.side = THREE.BackSide;
    this.material.uniforms["underwater"].value = false;
    renderer.render(this.mesh, camera);
  }
}
class WaterSimulation {
  constructor() {
    this.experience = new Experience();

    this._camera = this.experience.camera;

    this._geometry = new THREE.PlaneBufferGeometry(2, 2);

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
    console.log("emagfa", renderer);
    if (mesh?.material) {
      mesh.material.uniforms["texture"].value = oldTexture.texture;
      renderer.render(mesh, this._camera);
    }

    // renderer.setRenderTarget(newTexture);

    // TODO Camera is useless here, what should be done?

    this.texture = newTexture;
  }
}
