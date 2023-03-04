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
    this.water = this.experience.world.floor.water;
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

    // this.gui = new GUI({ container: document.querySelector(".hero-main") });
    // this.obj = {
    //   value: 0,
    // };

    this.setModel();
    this.setBuoyantObjects();
    this.onMouseMove();
    // this.setGUI();
  }
  // setGUI() {
  //   this.gui.add(this.obj, "value", -4, 5).onChange(() => {
  //     this.rectLight.position.x = this.obj.value;
  //   });
  // }

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
      if (child.name === "Screen") {
        child.scale.y = 0;
        this.tvScreen = child;
        this.tvScreen.material = new THREE.MeshBasicMaterial({
          map: this.resources.items.myself_on_screen,
        });
        GSAP.timeline().to(child.scale, { duration: 0.2, y: 1 }, 2);
      }
      if (child.name === "TVFrame") {
        child.scale.y = 0;
        child.scale.x = 0;
        GSAP.timeline().to(child.scale, { duration: 0.2, y: 1 }, 2);
        GSAP.timeline().to(child.scale, { duration: 0.2, x: 1 }, 2);
      }
      if (child.name === "High_bar") {
        child.scale.x = 0;
        GSAP.timeline().to(child.scale, { duration: 0.5, x: 1 }, 1);
      }
      if (child.name === "Parallel_bars") {
        child.scale.y = 0;
        GSAP.timeline().to(child.scale, { duration: 0.5, y: 1 }, 1);
      }
      if (child.name === "Lemur") {
        child.scale.y = 0;
        child.scale.x = 0;
        GSAP.timeline().to(child.scale, { duration: 0.5, y: 1 }, 2.5);
        GSAP.timeline().to(child.scale, { duration: 0.5, x: 1 }, 2.5);
      }
      if (child.name === "Rings") {
        child.scale.z = 0;
        child.scale.x = 0;
        GSAP.timeline().to(child.scale, { duration: 0.2, z: 1 }, 1.5);
        GSAP.timeline().to(child.scale, { duration: 0.2, x: 1 }, 1.5);
      }
      if (child.name === "Palm_tree") {
        child.scale.x = 0;
        child.scale.z = 0;

        GSAP.timeline().to(child.scale, { duration: 1, z: 1 }, 0.5);
        GSAP.timeline().to(child.scale, { duration: 1, x: 1 }, 0.5);
      }
      if (child.name === "Sea_floor") {
        child.scale.x = 0.5;
        child.scale.z = 0.5;

        GSAP.timeline().to(child.scale, { duration: 1, z: 1 }, 0.5);
        GSAP.timeline().to(child.scale, { duration: 1, x: 1 }, 0.5);
      }
    });
    const width = 1.25;
    const height = 0.95;
    const intensity = 2;
    this.rectLight = new THREE.RectAreaLight(
      0xffffff,
      intensity,
      width,
      height
    );
    // Attach the light to the TV screen
    this.actualRoom.children
      .find((x) => x.name === "Screen")
      .attach(this.rectLight);

    this.rectLight.position.set(
      this.actualRoom.children.find((x) => x.name === "Screen").position.x,
      this.actualRoom.children.find((x) => x.name === "Screen").position.y,
      this.actualRoom.children.find((x) => x.name === "Screen").position.z
    );
    this.rectLight.rotation.x = this.rectLight.parent.rotation.x;
    this.rectLight.rotation.y = this.rectLight.parent.rotation.y - Math.PI / 2;
    this.rectLight.rotation.z = this.rectLight.parent.rotation.z;

    this.actualRoom.add(this.rectLight);
    this.actualRoom.add(this.water);
    // const rectLightHelper = new RectAreaLightHelper(this.rectLight);
    // this.rectLight.add(rectLightHelper);

    this.scene.add(this.actualRoom);
    // in case scaling is needed:
    //this.actualRoom.scale.set(0.1, 0.1, 0.1);
  }
  setBuoyantObjects() {
    this.buoyantObjects = {};
    this.buoyantObjects = [
      this.actualRoom.children.find((x) => x.name === "duckcycle"),
      this.actualRoom.children.find((x) => x.name === "coconut_in_water"),
    ];

    console.log(this.buoyantObjects);
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
