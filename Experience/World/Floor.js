import * as THREE from "three";
import Experience from "../Experience.js";
import { Water } from "three/addons/objects/Water2.js";
import { Vector3 } from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

export default class Floor {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.renderer = this.experience.renderer;
    this.camera = this.experience.camera;
    this.scene = this.experience.scene;
    this.light = this.experience.world.environment.sunLight;
    this.resources = this.experience.resources;

    this.controls = this.experience.controls;

    this.setWater();
    this.update();
  }
  setWater() {
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.7,
      metalness: 1.1,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI * -0.5;
    ground.position.y = -0.5;
    this.scene.add(ground);
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("textures/sandy_ground.jpg", function (map) {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = 8;
      map.repeat.set(4, 4);

      groundMaterial.map = map;
      groundMaterial.needsUpdate = true;
    });

    // setPath("textures/skybox/");
    let materialArray = [];

    materialArray.push(
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/skybox/tropic_ft.jpg"),
      })
    );
    materialArray.push(
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/skybox/tropic_bk.jpg"),
      })
    );
    materialArray.push(
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/skybox/tropic_up.jpg"),
      })
    );
    materialArray.push(
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/skybox/tropic_dn.jpg"),
      })
    );
    materialArray.push(
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/skybox/tropic_rt.jpg"),
      })
    );
    materialArray.push(
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/skybox/tropic_lf.jpg"),
      })
    );

    for (let i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide;

    let skyboxGeo = new THREE.BoxGeometry(2000, 2000, 2000);
    let skybox = new THREE.Mesh(skyboxGeo, materialArray);

    skybox.position.y = 15;
    this.scene.add(skybox);

    // water
    this.waterParams = {
      color: "#8FDCFF",
      scale: 0.4,
      flowX: 0.15,
      flowY: 0.2,
    };
    const waterGeometry = new THREE.PlaneGeometry(50, 50);

    this.water = new Water(waterGeometry, {
      color: this.waterParams.color,
      scale: this.waterParams.scale,
      flowDirection: new THREE.Vector2(
        this.waterParams.flowX,
        this.waterParams.flowY
      ),
      textureWidth: 1024,
      textureHeight: 1024,
    });

    this.water.position.y = -0.3;
    this.water.rotation.x = -Math.PI / 2;
    this.scene.add(this.water);
  }
  update() {}
}
