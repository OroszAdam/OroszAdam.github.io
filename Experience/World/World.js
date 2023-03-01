import Experience from "../Experience";

import Room from "./Room.js";
import Floor from "./Floor";
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
    this.theme = this.experience.theme;

    this.resources.on("ready", () => {
      this.environment = new Environment();
      this.floor = new Floor();
      this.room = new Room();
      this.controls = new Controls();
    });

    this.theme.on("switch", (theme) => {
      this.switchTheme(theme);
    });
  }

  switchTheme(theme) {
    if (this.environment) {
      this.environment.switchTheme(theme);
    }
  }
  resize() {
    if (this.floor) {
      this.floor.resize();
    }
    if (this.environment) {
      this.environment.resize();
    }
  }
  update() {
    if (this.room) {
      this.room.update();
    }
    if (this.floor) {
      this.floor.update();
    }
    if (this.environment) {
      this.environment.update();
    }
  }
}
