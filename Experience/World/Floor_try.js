import * as THREE from "three";
import { loadFile } from "./functions.js";
import Experience from "../Experience.js";
import WaterSimulation from "./WaterSimulation";
import Water from "./Water.js";
import { EventDispatcher } from "three";
import EventEmitter from "events";
export default class Floor extends EventEmitter {
  constructor() {
    super();
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.renderer = this.experience.renderer;
    this.camera = this.experience.camera;
    this.scene = this.experience.scene;
    this.light = this.experience.world.environment.sunLight;
    this.resources = this.experience.resources;

    this.controls = this.experience.controls;

    this.setWater(
      this.camera.orthographicCamera,
      this.renderer,
      this.experience.canvas,
      this.controls
    );
  }
  setWater(camera, renderer, canvas, controls) {
    // Shader chunks
    loadFile("Experience/Shaders/utils.glsl").then((utils) => {
      THREE.ShaderChunk["utils"] = utils;
      // Ray caster
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();
      // Create mouse Controls
      // const controls = new TrackballControls(camera, renderer);

      // controls.screen.width = width;
      // controls.screen.height = height;

      const targetgeometry = new THREE.PlaneGeometry(10, 10);
      targetgeometry.attributes.position.array[2] =
        -targetgeometry.attributes.position.array[1];
      targetgeometry.attributes.position.array[1] = 0;
      targetgeometry.attributes.position.array[5] =
        -targetgeometry.attributes.position.array[4];
      targetgeometry.attributes.position.array[4] = 0;
      targetgeometry.attributes.position.array[8] =
        -targetgeometry.attributes.position.array[7];
      targetgeometry.attributes.position.array[7] = 0;
      targetgeometry.attributes.position.array[11] =
        -targetgeometry.attributes.position.array[10];
      targetgeometry.attributes.position.array[10] = 0;

      this.water = new Water(camera, renderer, targetgeometry);
      this.water.loaded.then(() => {
        this.waterMeshFinal = new THREE.Mesh(
          targetgeometry,
          this.water.material
        );
        // this.waterMeshFinal.rotation.x = Math.PI / 2;
        // this.waterMeshFinal.position.y = -1;
        this.scene.add(this.waterMeshFinal);
      });
      this.waterSimulation = new WaterSimulation(
        camera,
        renderer,
        targetgeometry
      );
      const loaded = [this.waterSimulation.loaded, this.water.loaded];

      Promise.all(loaded).then(() => {
        // canvas.addEventListener("mousemove", { handleEvent: onMouseMove });
        this.onMouseMove();
        // for (var i = 0; i < 20; i++) {
        //   this.waterSimulation.addDrop(
        //     renderer,
        //     Math.random() * 2 - 1,
        //     Math.random() * 2 - 1,
        //     0.03,
        //     i & 1 ? 0.02 : -0.02
        //   );
        // }

        this.animate();
      });
      // function onMouseMove(event) {
      //   const rect = canvas.getBoundingClientRect();

      //   mouse.x = ((event.clientX - rect.left) * 2) / width - 1;
      //   mouse.y = (-(event.clientY - rect.top) * 2) / height + 1;

      //   raycaster.setFromCamera(mouse, camera);

      //   const intersects = raycaster.intersectObject(targetmesh);

      //   for (let intersect of intersects) {
      //     waterSimulation.addDrop(
      //       renderer,
      //       intersect.point.x,
      //       intersect.point.z,
      //       0.03,
      //       0.04
      //     );
      //   }
      //   console.log(event);
      // }
    });
  }
  onMouseMove() {
    window.addEventListener("mousemove", (e) => {
      const rect = this.experience.canvas.getBoundingClientRect();

      this.mouse.x =
        ((e.clientX - rect.left) * 2) / this.experience.canvas.width - 1;
      this.mouse.y =
        (-(e.clientY - rect.top) * 2) / this.experience.canvas.height + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera.orthographicCamera);

      // this.raycaster.set(this.mouse, this.camera.position);
      const intersects = this.raycaster.intersectObject(this.waterMeshFinal);

      for (let intersect of intersects) {
        this.waterSimulation.addDrop(
          intersect.point.x,
          intersect.point.z,
          0.03,
          0.04
        );
      }
    });
  }
  // Main rendering loop
  animate() {
    console.log(this.waterSimulation);

    this.waterSimulation.stepSimulation(this.renderer);
    this.waterSimulation.updateNormals(this.renderer);

    const waterTexture = this.waterSimulation.texture.texture;

    // debug.draw(renderer, causticsTexture);

    this.renderer.renderer.setRenderTarget(null);
    this.renderer.renderer.setClearColor("white", 1);
    this.renderer.renderer.clear();
    this.water.draw(this.renderer, waterTexture);

    this.controls.update();

    window.requestAnimationFrame(this.animate);
  }
  resize() {}
  update() {}
}
