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
    // this.setPath();
    this.setScrollTrigger();
  }
  setScrollTrigger() {
    ScrollTrigger.matchMedia({
      // Desktop
      "(min-width: 969px)": () => {
        // First section move -------------------------------------
        this.firstMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".first-move",
            markers: false,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.6,
            // for updating x:
            invalidateOnRefresh: true,
          },
        });
        this.firstMoveTimeline.to(this.camera.perspectiveCamera.position, {
          x: () => {
            return this.sizes.width * -0.002;
          },
        });
        // Second section move -------------------------------------
        this.secondMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".second-move",
            markers: false,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.6,
            // for updating x:
            invalidateOnRefresh: true,
          },
        });
        this.secondMoveTimeline.to(
          this.camera.perspectiveCamera.position,
          {
            x: () => {
              return -0.7969502564026607;
            },
            y: () => {
              return 6.313444815450679;
            },
            z: () => {
              return 4.459328730372239;
            },
          },
          "same"
        );
        this.secondMoveTimeline.to(
          this.camera.perspectiveCamera.rotation,
          {
            x: () => {
              return -0.8;
            },
            y: () => {
              return 0.032;
            },
            z: () => {
              return 0.032;
            },
          },
          "same"
        );
        // Third section move -------------------------------------
        this.thirdMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".third-move",
            markers: false,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.6,
            // for updating x:
            invalidateOnRefresh: true,
          },
        });
        this.thirdMoveTimeline.to(
          this.camera.perspectiveCamera.position,
          {
            x: () => {
              return (
                this.camera.initialCameraPosition.x + this.sizes.width * -0.002
              );
            },
            y: () => {
              return this.camera.initialCameraPosition.y;
            },
            z: () => {
              return this.camera.initialCameraPosition.z;
            },
          },
          "same"
        );
        this.thirdMoveTimeline.to(
          this.camera.perspectiveCamera.rotation,
          {
            x: () => {
              return -0.8;
            },
            y: () => {
              return 0.032;
            },
            z: () => {
              return 0.032;
            },
          },
          "same"
        );
      },
      // Mobile
      "(max-width: 968px)": () => {
        console.log("mobile");
      },

      // all
      all: function () {},
    });
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
        markers: false,
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
//
//             y: 6.313444815450679;
//             z: 4.459328730372239;
//             _x: -0.7984051986807784;
//             _y: 0.031786750505606844;
//             _z: 0.0326075431588994;
