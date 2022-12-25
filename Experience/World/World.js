import * as THREE from "three";

import Experience from "../Experience";

import Room from "./Room.js";
import Controls from "./Controls";
import Environment from "./Environment";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;
    this.camera = this.experience.camera;
    this.resources = this.experience.resources;

    this.resources.on("ready", () => {
      this.environment = new Environment();
      this.room = new Room();
      this.controls = new Controls();
    });
  }

  resize() {}
  update() {
    if (this.room) {
      this.room.update();
    }
    if (this.control) {
      this.controls.update();
    }
  }
}
