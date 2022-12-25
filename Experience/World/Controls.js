import * as THREE from "three";

import Experience from "../Experience.js";

import GSAP from "gsap";
export default class Controls {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.camera = this.experience.camera;

    this.progress = 0;
    this.dummyCurve = new THREE.Vector3(0, 0, 0);

    this.lerp = {
      current: 0,
      target: 0,
      ease: 0.08,
    };
    this.position = new THREE.Vector3(0, 0, 0);
    this.lookAtPosition = new THREE.Vector3(0, 0, 0);

    // for making the camera look in a certain direction
    this.directionalVector = new THREE.Vector3(0, 0, 0);
    this.staticVector = new THREE.Vector3(0, 1, 0);
    this.crossVector = new THREE.Vector3(0, 0, 0);

    this.setPath();
    this.onWheel();
  }

  setPath() {
    //Create a closed wavey loop
    this.curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-10, 4, 0),
        new THREE.Vector3(0, 4, 10),
        new THREE.Vector3(10, 4, 0),
        new THREE.Vector3(0, 4, -10),
      ],
      true
    );

    const points = this.curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    // Create the final object to add to the scene
    const curveObject = new THREE.Line(geometry, material);

    // Show curve on the scene
    // this.scene.add(curveObject);
  }

  onWheel() {
    window.addEventListener("wheel", (e) => {
      console.log(e);
      if (e.deltaY > 0) {
        this.lerp.target += 0.01;
        // this.back = false;
      } else {
        this.lerp.target -= 0.01;
        // this.back = true;
        if (this.lerp.target < 0) {
          this.lerp.target = -this.lerp.target;
        }
      }
    });
  }
  resize() {}
  update() {
    this.lerp.current = GSAP.utils.interpolate(
      this.lerp.current,
      this.lerp.target,
      this.lerp.ease
    );

    this.curve.getPointAt(this.lerp.current % 1, this.position);
    this.camera.orthographicCamera.position.copy(this.position);

    // subtract vectors:
    this.directionalVector.subVectors(
      this.curve.getPointAt((this.lerp.current % 1) + 0.000001),
      this.position
    );
    this.directionalVector.normalize();
    this.crossVector.crossVectors(this.directionalVector, this.staticVector);
    this.crossVector.multiplyScalar(100000);
    // this.camera.orthographicCamera.lookAt(this.crossVector);
    this.camera.orthographicCamera.lookAt(0, 0, 0);

    // Make the camera follow a curve when scrolling:

    // if (this.back) {
    //   this.lerp.target -= 0.0001;
    // } else {
    //   this.lerp.target += 0.0001;
    // }
    // this.lerp.target = GSAP.utils.clamp(0, 1, this.lerp.target);
    // this.lerp.current = GSAP.utils.clamp(0, 1, this.lerp.current);

    // this.curve.getPointAt(this.lerp.current, this.position);
    // this.curve.getPointAt(this.lerp.current + 0.00001, this.lookAtPosition);
    // // this.progress -= 0.01;

    // this.camera.orthographicCamera.position.copy(this.position);
    // this.camera.orthographicCamera.lookAt(this.lookAtPosition);
  }
}
