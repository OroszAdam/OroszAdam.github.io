import * as THREE from "three";
import { Color } from "three";

import Experience from "../Experience.js";
import waterFragmentShader from "../Shaders/water/fragmentShader.glsl";
import waterVertexShader from "../Shaders/water/vertexShader.glsl";

export default class Floor {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.renderer = this.experience.renderer;
    this.camera = this.experience.camera;
    this.scene = this.experience.scene;
    this.light = this.experience.world.environment.sunLight;

    this.resources = this.experience.resources;
    this.setFloor();
  }
  setFloor() {
    // const waterNormals = new THREE.TextureLoader().load(
    //   "/textures/waternormals.jpg",
    //   function (texture) {
    //     texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    //   }
    // );
    // water = new THREE.Water(this.renderer, this.camera, this.scene, {
    //   textureWidth: 512,
    //   textureHeight: 512,
    //   waterNormals: waterNormals,
    //   alpha: 1.0,
    //   sunDirection: this.light.position.clone().normalize(),
    //   sunColor: 0xffffff,
    //   waterColor: 0x001e0f,
    //   distortionScale: 50.0,
    // });

    // mirrorMesh = new THREE.Mesh(
    //   new THREE.PlaneBufferGeometry(
    //     parameters.width * 500,
    //     parameters.height * 500
    //   ),
    //   water.material
    // );

    // mirrorMesh.add(water);
    // mirrorMesh.rotation.x = -Math.PI * 0.5;
    // scene.add(mirrorMesh);

    this.waterGeometry = new THREE.PlaneGeometry(100, 100);
    this.waterMaterial = new THREE.ShaderMaterial({
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
    });
    // const water = new Water(waterGeometry, {
    //   textureWidth: 50,
    //   textureHeight: 50,
    //   waterNormals: new THREE.TextureLoader().load(
    //     "textures/texture1.jpg",
    //     function (texture) {
    //       texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    //     }
    //   ),
    //   alpha: 1.0,
    //   sunDirection: new THREE.Vector3(0, 0, 2),
    //   sunColor: 0xffffff,
    //   waterColor: 0x000c1e,
    //   distortionScale: 3.7,
    //   fog: this.scene.fog !== undefined,
    // });
    this.water = new THREE.Mesh(this.waterGeometry, this.waterMaterial);
    this.water.rotation.x = -Math.PI / 2;
    this.water.position.y = -1;
    const water = new Water();

    this.scene.add(water);
    // this.plane.position.y = -0.7;
    // this.plane.receiveShadow = true;
  }
  resize() {}
  update() {}
}
class Water {
  constructor() {
    this.geometry = new THREE.PlaneBufferGeometry(2, 2, 200, 200);

    const shadersPromises = [
      loadFile("shaders/water/vertex.glsl"),
      loadFile("shaders/water/fragment.glsl"),
    ];

    this.loaded = Promise.all(shadersPromises).then(
      ([vertexShader, fragmentShader]) => {
        this.material = new THREE.RawShaderMaterial({
          uniforms: {
            light: { value: light },
            tiles: { value: tiles },
            sky: { value: textureCube },
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
    renderer.render(this.mesh, camera);

    this.material.side = THREE.BackSide;
    this.material.uniforms["underwater"].value = false;
    renderer.render(this.mesh, camera);
  }
}
