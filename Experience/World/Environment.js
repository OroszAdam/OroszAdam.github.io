import * as THREE from "three";

import Experience from "../Experience.js";
import GSAP from "gsap";

import GUI from "lil-gui";
import { Color } from "three";
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
  //   });
  //   this.gui.add(this.obj, "intensity", 0, 10).onChange(() => {
  //     this.sunLight.intensity = this.obj.intensity;
  //     this.sunLight.ambientLight = this.obj.intensity;
  //   });
  // }
  // setPath() {
  //   //Create a closed wavey loop
  //   this.curve = new THREE.CatmullRomCurve3(
  //     [
  //       new THREE.Vector3(-10, 4, 0),
  //       new THREE.Vector3(0, 4, 10),
  //       new THREE.Vector3(10, 4, 0),
  //       new THREE.Vector3(0, 4, -10),
  //     ],
  //     true
  //   );

  //   const points = this.curve.getPoints(50);
  //   const geometry = new THREE.BufferGeometry().setFromPoints(points);

  //   const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

  //   // Create the final object to add to the scene
  //   const curveObject = new THREE.Line(geometry, material);

  //   // Show curve on the scene
  //   this.scene.add(curveObject);
  // }
  setSunLight() {
    this.sunLight = new THREE.DirectionalLight("#ffffff", 3);
    window.matchMedia("(min-width: 1080px)").matches
      ? (this.sunLight.castShadow = true)
      : (this.sunLight.castShadow = false);
    this.sunLight.shadow.camera.far = 20;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.normalBias = 0.1;
    this.sunLight.intensity = 2.5;
    this.sunLight.position.set(5, 4.5, 3);
    this.scene.add(this.sunLight);

    this.ambientLight = new THREE.AmbientLight("#ffffff", 0.8);
    this.scene.add(this.ambientLight);

    // var tl = GSAP.timeline({ repeat: -1, repeatDelay: 0, delay: 0 });
    // tl.to(this.sunLight.position.x, 4, {
    //   bezier: {
    //     type: "quadratic",
    //     values: [
    //       /*p1*/ { x: 0, y: 0 },
    //       { x: 200, y: 0 },
    //       { x: 200, y: 200 },
    //       /*p2*/ { x: 200, y: 400 },
    //       { x: 0, y: 400 },
    //       /*p3*/ { x: -200, y: 400 },
    //       { x: -200, y: 200 },
    //       /*p4*/ { x: -200, y: 0 },
    //       { x: 0, y: 0 },
    //     ],
    //     autoRotate: false,
    //   },
    //   ease: GSAP.easeNone,
    // });
    // const flow = new Flow(this.sunLight);
    // flow.updateCurve(0, curve);
    // scene.add(flow.object3D);

    // const clock = new THREE.Clock();
    // let delta;
  }
  switchTheme(theme) {
    const rootStyles = getComputedStyle(document.documentElement);
    if (theme === "dark") {
      document.documentElement.style.setProperty(
        "--primary-textColor",
        rootStyles.getPropertyValue("--primary-babyBlue")
      );
      document.documentElement.style.setProperty(
        "--primary-sectionBackgroundColor",
        rootStyles.getPropertyValue("--primary-navyBlueTransparent")
      );
      document.documentElement.style.setProperty(
        "--primary-sectionTextBackgroundColor",
        rootStyles.getPropertyValue("--primary-navyBlue")
      );

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
        intensity: 0.05,
      });
      GSAP.to(this.ambientLight, {
        intensity: 0.8,
      });
      this.experience.world.floor.water.material.uniforms.isNight.value = true;
    } else {
      document.documentElement.style.setProperty(
        "--primary-textColor",
        rootStyles.getPropertyValue("--primary-navyBlue")
      );
      document.documentElement.style.setProperty(
        "--primary-sectionBackgroundColor",
        rootStyles.getPropertyValue("--primary-babyBlueTransparent")
      );
      document.documentElement.style.setProperty(
        "--primary-sectionTextBackgroundColor",
        rootStyles.getPropertyValue("--primary-babyBlue")
      );
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
        intensity: 2.5,
      });
      GSAP.to(this.ambientLight, {
        intensity: 0.8,
      });
      this.experience.world.floor.water.material.uniforms.isNight.value = false;
    }
  }
  resize() {
    // Desktop mode
    if (window.matchMedia("(min-width: 1080px)").matches) {
      this.sunLight.castShadow = true;
    }
    // Mobile mode
    else {
      this.sunLight.castShadow = false;
    }
  }
  update() {
    // console.log(this.sunLight.position);
  }
}
