import * as THREE from "three";

import Experience from "../Experience.js";
import GSAP from "gsap";

import GUI from "lil-gui";
export default class Environment {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // this.gui = new GUI({ container: document.querySelector(".hero-main") });
    // this.obj = {
    //   colorObj: { r: 0, g: 0, b: 0 },
    //   intensity: 3,
    // };

    this.setSunLight();
    //this.setGUI();
  }

  // setGUI() {
  //   this.gui.addColor(this.obj, "colorObj").onChange(() => {
  //     this.sunLight.color.copy(this.obj.colorObj);
  //     this.ambientLight.color.copy(this.obj.colorObj);
  //     console.log(this.obj.colorObj);
  //   });
  //   this.gui.add(this.obj, "intensity", 0, 10).onChange(() => {
  //     this.sunLight.intensity = this.obj.intensity;
  //     this.sunLight.ambientLight = this.obj.intensity;
  //   });
  // }
  setSunLight() {
    this.sunLight = new THREE.DirectionalLight("#ffffff", 3);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.far = 20;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.sunLight.shadow.normalBias = 0.05;
    this.sunLight.position.set(1.5, 7, 3);
    this.scene.add(this.sunLight);

    this.ambientLight = new THREE.AmbientLight("#ffffff", 0.8);
    this.scene.add(this.ambientLight);
  }
  switchTheme(theme) {
    if (theme === "dark") {
      GSAP.to(this.sunLight.color, {
        r: 0.18823529411764706,
        g: 0.2549019607843137,
        b: 0.39215686274509803,
      });
      GSAP.to(this.ambientLight.color, {
        r: 0.18823529411764706,
        g: 0.2549019607843137,
        b: 0.39215686274509803,
      });
      GSAP.to(this.sunLight, {
        intensity: 0.69,
      });
      GSAP.to(this.ambientLight, {
        intensity: 0.69,
      });
    } else {
      GSAP.to(this.sunLight.color, {
        r: 1,
        g: 1,
        b: 1,
      });
      GSAP.to(this.ambientLight.color, {
        r: 1,
        g: 1,
        b: 1,
      });
      GSAP.to(this.sunLight, {
        intensity: 1,
      });
      GSAP.to(this.ambientLight, {
        intensity: 1,
      });
    }
  }
  resize() {}
  update() {}
}
