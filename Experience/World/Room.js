import * as THREE from "three";

import Experience from "../Experience.js";

export default class Room {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.room = this.resources.items.room;
    this.actualRoom = this.room.scene;

    console.log(this.actualRoom.children);
    this.setModel();
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
      if (child.name === "Screen") {
        child.material = new THREE.MeshBasicMaterial({
          map: this.resources.items.screen,
        });
        console.log(child.material);
      }
    });

    this.scene.add(this.actualRoom);
    // in case scaling is needed:
    //this.actualRoom.scale.set(0.1, 0.1, 0.1);
  }
  resize() {}
  update() {}
}
