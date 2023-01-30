import * as THREE from "three";
import Experience from "../Experience.js";
import { Water } from "three/addons/objects/Water2.js";

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
  }
  setWater() {
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.8,
      metalness: 0.4,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI * -0.5;
    ground.position.y = -2;
    this.scene.add(ground);
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("textures/tiles.jpg", function (map) {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = 16;
      map.repeat.set(4, 4);
      groundMaterial.map = map;
      groundMaterial.needsUpdate = true;
    });
    new THREE.CubeTextureLoader().setPath("textures/skybox/").load(
      // urls of images used in the cube texture
      [
        "Daylight Box_Back.bmp",
        "Daylight Box_Back.bmp",
        "Daylight Box_Back.bmp",
        "Daylight Box_Back.bmp",
        "Daylight Box_Back.bmp",
        "Daylight Box_Back.bmp",
      ],
      // what to do when loading is over
      (cubeTexture) => {
        // Geometry
        const geometry = new THREE.SphereGeometry(200, 0, 0);
        // Material
        const material = new THREE.MeshBasicMaterial({
          // CUBE TEXTURE can be used with
          // the environment map property of
          // a material.
          envMap: cubeTexture,
        });
        // Mesh
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        // CUBE TEXTURE is also an option for a background
        this.scene.background = cubeTexture;
      }
    );

    // water
    const params = {
      color: "#ffffff",
      scale: 4,
      flowX: 1,
      flowY: 1,
    };
    const waterGeometry = new THREE.PlaneGeometry(50, 50);

    this.water = new Water(waterGeometry, {
      color: params.color,
      scale: params.scale,
      flowDirection: new THREE.Vector2(params.flowX, params.flowY),
      textureWidth: 1024,
      textureHeight: 1024,
    });

    // this.water.position.y = -1;
    this.water.rotation.x = -Math.PI / 2;
    this.scene.add(this.water);
  }
}
