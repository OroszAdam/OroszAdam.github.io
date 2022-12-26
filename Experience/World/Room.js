import * as THREE from "three";

import Experience from "../Experience.js";
import GSAP from "gsap";

export default class Room {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.room = this.resources.items.room;
    this.actualRoom = this.room.scene;

    this.lerpX = {
      current: 0,
      target: 0,
      ease: 0.08,
    };
    this.lerpY = {
      current: 0,
      target: 0,
      ease: 0.08,
    };

    // console.log(this.actualRoom.children);
    this.setModel();
    this.onMouseMove();
  }

  setModel() {
    this.actualRoom.children.forEach((child) => {
      child.castShadow = true;
      child.receiveShadow = true;
      if (child instanceof THREE.Group) {
        child.children.forEach((groupchild) => {
          groupchild.castShadow = true;
          groupchild.receiveShadow = true;
        });
      }
      // Add video to the screen:
      // if (child.name === "Screen") {
      //   child.material = new THREE.MeshBasicMaterial({
      //     map: this.resources.items.screen,
      //   });
      // }
    });

    this.scene.add(this.actualRoom);
    // in case scaling is needed:
    //this.actualRoom.scale.set(0.1, 0.1, 0.1);
  }

  onMouseMove() {
    window.addEventListener("mousemove", (e) => {
      this.rotationY =
        (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      this.lerpY.target = this.rotationY * 0.08;
      this.rotationX =
        (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      this.lerpX.target = this.rotationX * 0.03;
    });
  }

  resize() {}
  update() {
    this.lerpX.current = GSAP.utils.interpolate(
      this.lerpX.current,
      this.lerpX.target,
      this.lerpX.ease
    );
    this.lerpY.current = GSAP.utils.interpolate(
      this.lerpY.current,
      this.lerpY.target,
      this.lerpY.ease
    );

    this.actualRoom.rotation.y = this.lerpY.current;
    this.actualRoom.rotation.x = this.lerpX.current;
  }
}
