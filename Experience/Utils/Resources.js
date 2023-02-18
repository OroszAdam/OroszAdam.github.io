import * as THREE from "three";

import EventEmitter from "events";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import Experience from "../Experience.js";
import GSAP from "gsap";

export default class Resources extends EventEmitter {
  constructor(assets) {
    super(); // For accessing EventEmitter

    this.experience = new Experience();
    this.renderer = this.experience.renderer;

    this.assets = assets;

    this.items = {};
    this.queue = this.assets.length;
    this.loaded = 0;

    this.loadingManager = new THREE.LoadingManager();

    const progressBar = document.querySelector(".circular-progress");
    this.progressBarContainer = document.querySelector(
      ".progress-bar-container"
    );
    this.logo = document.querySelector(".logo_cococali");
    this.page = document.querySelector(".page");
    this.toggleDayNightBar = document.querySelector(".toggle-bar");

    this.loadingManager.onProgress = function (url, loaded, total) {
      progressBar.style.background = `conic-gradient(var(--primary-navyBlue) ${
        (loaded / total) * 360
      }deg, #ffffff ${(loaded / total) * 360 + 30}deg)`;
    };

    this.loadingManager.onLoad = () => {
      setTimeout(() => {
        this.finishLoading();
      }, 2000);
    };
    this.loadingManager.onError = function () {};

    this.loadInProgressAnimation();
    this.setLoaders();
    this.startLoading();
  }
  finishLoading() {
    GSAP.timeline().to(
      this.progressBarContainer,
      { duration: 2, opacity: 0 },
      0.5
    );
    GSAP.timeline().to(this.progressBar, { duration: 1.2, scale: 1.5 }, 0.5);
    GSAP.timeline().to(
      this.toggleDayNightBar,
      { duration: 2, opacity: 1 },
      0.5
    );
    GSAP.timeline().to(
      this.logo,
      {
        onComplete: () => {
          this.page.style.position = "inherit";
          clearInterval(this.progress);
        },
        duration: 2,
        scale: 1.5,
      },
      0.5
    );
  }
  loadInProgressAnimation() {
    let circularProgress = document.querySelector(".circular-progress-outer");
    let progressStartValue = 0,
      progressEndValue = 50,
      speed = 36,
      stepValue = 7.2,
      tiktok = true;
    this.progress = setInterval(() => {
      progressStartValue++;
      tiktok
        ? (circularProgress.style.background = `conic-gradient(var(--primary-navyBlue) ${
            progressStartValue * stepValue
          }deg, #ffffff ${progressStartValue * 0 + 0}deg)`)
        : (circularProgress.style.background = `conic-gradient(#ffffff ${
            progressStartValue * stepValue
          }deg, var(--primary-navyBlue) ${progressStartValue * 0 + 0}deg)`);
      if (progressStartValue == progressEndValue) {
        tiktok
          ? (circularProgress.style.background = `conic-gradient(#ffffff 0deg, var(--primary-navyBlue) 0deg)`)
          : (circularProgress.style.background = `conic-gradient(var(--primary-navyBlue) 0deg, #ffffff 0deg)`);
        progressStartValue = 0;
        tiktok = !tiktok;
      }
    }, speed);
  }
  setLoaders() {
    this.loaders = {};
    this.loaders.gltfLoader = new GLTFLoader(this.loadingManager);
    this.loaders.dracoLoader = new DRACOLoader();
    this.loaders.dracoLoader.setDecoderPath("/draco/");
    this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader);
  }

  startLoading() {
    for (const asset of this.assets) {
      if (asset.type === "glbModel") {
        this.loaders.gltfLoader.load(asset.path, (file) => {
          this.singleAssetLoaded(asset, file);
        });
      } else if (asset.type === "videoTexture") {
        this.video = {};
        this.videoTexture = {};

        this.video[asset.name] = document.createElement("video");
        this.video[asset.name].src = asset.path;
        this.video[asset.name].muted = true;
        this.video[asset.name].playInLine = true;
        this.video[asset.name].autoplay = true;
        this.video[asset.name].loop = true;
        this.video[asset.name].play();

        this.videoTexture[asset.name] = new THREE.VideoTexture(
          this.video[asset.name]
        );
        this.videoTexture[asset.name].flipY = false;
        this.videoTexture[asset.name].minFilter = THREE.NearestFilter;
        this.videoTexture[asset.name].magFilter = THREE.NearestFilter;
        this.videoTexture[asset.name].generateMipmaps = false;
        this.videoTexture[asset.name].encoding = THREE.sRGBEncoding;

        this.singleAssetLoaded(asset, this.videoTexture[asset.name]);
      }
    }
  }

  singleAssetLoaded(asset, file) {
    this.items[asset.name] = file;
    this.loaded++; // we have loaded the file

    // if everything is loaded
    if (this.loaded === this.queue) {
      this.emit("ready");
    }
  }
}
