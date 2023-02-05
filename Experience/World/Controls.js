import Experience from "../Experience.js";
import GSAP from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";

export default class Controls {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.sizes = this.experience.sizes;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this.camera = this.experience.camera;
    this.room = this.experience?.world?.room?.actualRoom;
    GSAP.registerPlugin(ScrollTrigger);

    this.setPath();
  }

  setPath() {
    this.timeline = new GSAP.timeline();
    this.timeline.to(this.camera?.perspectiveCamera.position, {
      x:
        // put in a function to update
        () => {
          return this.sizes.width * -0.002;
        },
      scrollTrigger: {
        trigger: ".page-wrapper",
        markers: true,
        start: "top top",
        end: "+=100%",
        scrub: true,
        // for updating x:
        invalidateOnRefresh: true,
      },
    });
  }
  resize() {}
  update() {}
}
