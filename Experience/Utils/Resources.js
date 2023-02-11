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

    this.loadingManager.onStart = function (url, item, total) {
      console.log(`Started loading: ${url}`);
    };

    const progressBar = document.querySelector(".circular-progress");
    this.loadingManager.onProgress = function (url, loaded, total) {
      console.log(`Loading: ${url}`);
      progressBar.style.background = `conic-gradient(var(--primary-navyBlue) ${
        (loaded / total) * 360
      }deg, #ffffff ${(loaded / total) * 360 + 30}deg)`;
    };

    const progressBarContainer = document.querySelector(
      ".progress-bar-container"
    );
    const logo = document.querySelector(".logo_cococali");
    const page = document.querySelector(".page");
    const toggleDayNightBar = document.querySelector(".toggle-bar");
    this.loadingManager.onLoad = function () {
      GSAP.timeline().to(
        progressBarContainer,
        { duration: 2, opacity: 0 },
        0.5
      );
      GSAP.timeline().to(progressBar, { duration: 1.2, scale: 1.5 }, 0.5);
      GSAP.timeline().to(toggleDayNightBar, { duration: 2, opacity: 1 }, 0.5);
      GSAP.timeline().to(
        logo,
        {
          onComplete: () => {
            page.style.position = "inherit";
          },
          duration: 2,
          scale: 1.5,
        },
        0.5
      );
      console.log(`Loaded.`);
    };
    this.loadingManager.onError = function () {
      console.log(`Problem loading.`);
    };

    this.setLoaders();
    this.startLoading();
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
