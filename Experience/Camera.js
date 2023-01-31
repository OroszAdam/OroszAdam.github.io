import * as THREE from "three";

import Experience from "./Experience";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";

export default class Camera {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;
    this.createPerspectiveCamera();
    this.createOrthographicCamera();
    this.setOrbitControls();
    // this.setTrackballControls();
  }

  createPerspectiveCamera() {
    this.perspectiveCamera = new THREE.PerspectiveCamera(
      35,
      this.sizes.aspect,
      0.1,
      1000
    );
    this.scene.add(this.perspectiveCamera);
    this.perspectiveCamera.rotation.x = -0.7057;
    this.perspectiveCamera.position.x = 0.15;
    this.perspectiveCamera.position.y = 10;
    this.perspectiveCamera.position.z = 11.6;
  }
  createOrthographicCamera() {
    this.orthographicCamera = new THREE.OrthographicCamera(
      (-this.sizes.aspect * this.sizes.frustrum) / 2,
      (this.sizes.aspect * this.sizes.frustrum) / 2,
      this.sizes.frustrum / 2,
      -this.sizes.frustrum / 2,
      -50,
      50
    );
    // this.helper = new THREE.CameraHelper(this.orthographicCamera);
    // this.scene.add(this.helper);
    this.orthographicCamera.position.y = 3;
    this.orthographicCamera.position.z = 3;
    this.orthographicCamera.rotation.x = -Math.PI / 5.5;
    this.orthographicCamera.zoom = 0.5;
    this.orthographicCamera.updateProjectionMatrix();
    this.scene.add(this.orthographicCamera);

    const size = 20;
    const divisions = 20;

    // const gridHelper = new THREE.GridHelper(size, divisions);
    // this.scene.add(gridHelper);

    // const axesHelper = new THREE.AxesHelper(10);
    // this.scene.add(axesHelper);
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.perspectiveCamera, document.body);
    this.controls.enableDamping = true;
    this.controls.enableZoom = true;
  }
  // setTrackballControls() {
  //   this.controls = new TrackballControls(this.orthographicCamera, this.canvas);
  //   this.controls.screen.width = this.canvas.width;
  //   this.controls.screen.height = this.canvas.height;
  // }

  resize() {
    // Updateing Perspective Camera on Resize
    this.perspectiveCamera.aspect = this.sizes.aspect;
    this.perspectiveCamera.updateProjectionMatrix();

    // Updating Orthographics Camera on Resize
    this.orthographicCamera.left =
      (-this.sizes.aspect * this.sizes.frustrum) / 2;
    this.orthographicCamera.right =
      (this.sizes.aspect * this.sizes.frustrum) / 2;
    this.orthographicCamera.top = this.sizes.frustrum / 2;
    this.orthographicCamera.bottom = -this.sizes.frustrum / 2;
    this.orthographicCamera.updateProjectionMatrix();
  }

  update() {
    // For orbital controls:
    // this.controls.update();
    // this.helper.matrixWorldNeedsUpdate = true;
    // this.helper.update();
    // this.helper.position.copy(this.orthographicCamera.position);
    // this.helper.rotation.copy(this.orthographicCamera.rotation);
  }
}
