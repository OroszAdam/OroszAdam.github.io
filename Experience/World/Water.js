import * as THREE from "three";

import { loadFile } from "./functions";

export default class Water {
  constructor(camera, renderer, geometry) {
    this.camera = camera;
    this.renderer = renderer;
    this.geometry = geometry;
    // Light direction
    const light = [0.7559289460184544, 0.7559289460184544, -0.3779644730092272];
    const textureloader = new THREE.TextureLoader();

    const tiles = textureloader.load("/textures/tiles.jpg");
    // // Textures
    // const cubetextureloader = new THREE.CubeTextureLoader();

    // const textureCube = cubetextureloader.load([
    //   "./xpos.jpg",
    //   "xneg.jpg",
    //   "ypos.jpg",
    //   "ypos.jpg",
    //   "zpos.jpg",
    //   "zneg.jpg",
    // ]);

    const shadersPromises = [
      loadFile("Experience/Shaders/water/vertex.glsl"),
      loadFile("Experience/Shaders/water/fragment.glsl"),
    ];

    this.loaded = Promise.all(shadersPromises).then(
      ([vertexShader, fragmentShader]) => {
        this.material = new THREE.RawShaderMaterial({
          uniforms: {
            light: { value: light },
            tiles: { value: tiles },
            // sky: { value: textureCube },
            water: { value: null },
            causticTex: { value: null },
            underwater: { value: false },
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
      }
    );
  }

  draw(renderer, waterTexture, causticsTexture) {
    this.material.uniforms["water"].value = waterTexture;
    this.material.uniforms["causticTex"].value = causticsTexture;

    this.material.side = THREE.FrontSide;
    this.material.uniforms["underwater"].value = true;
    // renderer.render(this.mesh, this.camera);

    this.material.side = THREE.BackSide;
    this.material.uniforms["underwater"].value = false;
    // renderer.render(this.mesh, this.camera);
  }
}
