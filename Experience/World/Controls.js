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
      "(min-width: 1080px)": () => {
        const titleComp = document.querySelector(".hero-main");
        const secondTitleComp = document.querySelector(".hero-second");
        titleComp.style.top = "3%";
        titleComp.style.bottom = "auto";
        secondTitleComp.style.top = "auto";
        secondTitleComp.style.bottom = "3%";

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
              return -0.8;
            },
            y: () => {
              return 6.3;
            },
            z: () => {
              return 4.5;
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
            end: "bottom top",
            scrub: 0.6,
            // for updating x:
            invalidateOnRefresh: true,
          },
        });
        this.thirdMoveTimeline.to(
          this.camera.perspectiveCamera.position,
          {
            //6.18363840003403, y: 5.238163550005358, z: 4.9061590914479405
            x: () => {
              return 6.2;
            },
            y: () => {
              return 5.2;
            },
            z: () => {
              return 4.9;
            },
          },
          "same"
        );
        this.thirdMoveTimeline.to(
          this.camera.perspectiveCamera.rotation,
          {
            x: () => {
              return -1.15;
            },
            y: () => {
              return 0.84;
            },
            z: () => {
              return 1.04;
            },
          },
          "same"
        );
        // Fourth section move -------------------------------------
        this.fourthMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".fourth-move",
            markers: false,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
            // for updating x:
            invalidateOnRefresh: true,
          },
        });
        this.fourthMoveTimeline.to(
          this.camera.perspectiveCamera.position,
          {
            //0.8167064263210997, y: 6.395481215100333, z: 2.41732406259092,
            x: () => {
              return 0.82;
            },
            y: () => {
              return 6.4;
            },
            z: () => {
              return 2.42;
            },
          },
          "same"
        );
        this.fourthMoveTimeline.to(
          this.camera.perspectiveCamera.rotation,
          {
            //-0.8920911461277647, _y: -0.18276994660438076, _z: -0.22165266086880536,
            x: () => {
              return -0.89;
            },
            y: () => {
              return -0.183;
            },
            z: () => {
              return -0.22;
            },
          },
          "same"
        );
        // Fifth section move -------------------------------------
        this.fifthMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".fifth-move",
            markers: false,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
            // for updating x:
            invalidateOnRefresh: true,
          },
        });
        this.fifthMoveTimeline.to(
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
        this.fifthMoveTimeline.to(
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
      "(max-width: 1080px)": () => {
        const titleComp = document.querySelector(".hero-main");
        const secondTitleComp = document.querySelector(".hero-second");
        titleComp.style.top = "auto";
        titleComp.style.bottom = "3%";
        secondTitleComp.style.top = "3%";
        secondTitleComp.style.bottom = "auto";
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
