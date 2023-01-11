import * as THREE from "three";
import { Color } from "three";

import Experience from "../Experience.js";
import { Water } from "three/addons/objects/Water.js";

export default class Floor {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.renderer = this.experience.renderer;
    this.camera = this.experience.camera;
    this.scene = this.experience.scene;
    this.light = this.experience.world.environment.sunLight;
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

    let g = new THREE.PlaneGeometry(50, 50, 15, 15);
    g.rotateX(-Math.PI * 0.5);
    let vertData = [];
    let v3 = new THREE.Vector3(); // for re-use
    for (let i = 0; i < g.attributes.position.count; i++) {
      v3.fromBufferAttribute(g.attributes.position, i);
      vertData.push({
        initH: v3.y,
        amplitude: THREE.MathUtils.randFloatSpread(2),
        phase: THREE.MathUtils.randFloat(0, Math.PI),
      });
    }
    let m = new THREE.MeshLambertMaterial({
      color: "aqua",
    });
    let o = new THREE.Mesh(g, m);
    this.scene.add(o);

    let clock = new THREE.Clock();

    renderer.setAnimationLoop(() => {
      let time = clock.getElapsedTime();

      vertData.forEach((vd, idx) => {
        let y = vd.initH + Math.sin(time + vd.phase) * vd.amplitude;
        g.attributes.position.setY(idx, y);
      });
      g.attributes.position.needsUpdate = true;
      g.computeVertexNormals();

      renderer.render(scene, camera);
    });

    this.geometry = new THREE.PlaneGeometry(100, 100, 100, 100);
    this.material = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#05445e"),
      // set the texture side
      side: THREE.BackSide,
    });
    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
    this.plane.rotation.x = Math.PI / 2;
    this.plane.position.y = -0.7;
    this.plane.receiveShadow = true;
  }
  resize() {}
  update() {}
}
