import * as THREE from "three";
import Experience from "../Experience.js";

import EventEmitter from "events";

export default class Floor extends EventEmitter {
  constructor() {
    super();
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.renderer = this.experience.renderer;
    this.camera = this.experience.camera;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.controls = this.experience.controls;
    this.clock = new THREE.Clock();

    this.setWater();

    this.update();
  }
  setWater() {
    // Set up depth buffer
    this.depthTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );
    this.depthTarget.texture.format = THREE.RGBAFormat;
    this.depthTarget.texture.minFilter = THREE.NearestFilter;
    this.depthTarget.texture.magFilter = THREE.NearestFilter;
    this.depthTarget.texture.generateMipmaps = false;
    this.depthTarget.stencilBuffer = false;
    this.depthTarget.depthBuffer = true;
    this.depthTarget.depthTexture = new THREE.DepthTexture();
    this.depthTarget.depthTexture.type = THREE.UnsignedShortType;

    // This is used as a hack to get the depth of the pixels at the water surface by redrawing the scene with the water in the depth buffer
    this.depthTarget2 = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );
    this.depthTarget2.texture.format = THREE.RGBAFormat;
    this.depthTarget2.texture.minFilter = THREE.NearestFilter;
    this.depthTarget2.texture.magFilter = THREE.NearestFilter;
    this.depthTarget2.texture.generateMipmaps = false;
    this.depthTarget2.stencilBuffer = false;
    this.depthTarget2.depthBuffer = true;
    this.depthTarget2.depthTexture = new THREE.DepthTexture();
    this.depthTarget2.depthTexture.type = THREE.UnsignedShortType;
    var waterLinesTexture = new THREE.TextureLoader().load(
      "/textures/WaterTexture.png"
      // "/textures/water/Water_1_M_Normal.jpg"
    );
    waterLinesTexture.wrapS = THREE.RepeatWrapping;
    waterLinesTexture.wrapT = THREE.RepeatWrapping;
    var uniforms = {
      resolution: {
        value: new THREE.Vector2(
          window.innerWidth * this.renderer.renderer.pixelRatio,
          window.innerHeight * this.renderer.renderer.pixelRatio
        ),
      },
      uTime: { value: 0.0 },
      uSurfaceTexture: { type: "t", value: waterLinesTexture },
      cameraNear: { value: this.camera.perspectiveCamera.near },
      cameraFar: { value: this.camera.perspectiveCamera.far },
      uDepthMap: { value: this.depthTarget.depthTexture },
      uDepthMap2: { value: this.depthTarget2.depthTexture },
      isMask: { value: false },
      isNight: { value: false },
      uScreenSize: {
        value: new THREE.Vector4(
          window.innerWidth,
          window.innerHeight,
          1 / window.innerWidth,
          1 / window.innerHeight
        ),
      },
    };

    // Used to know which areas of the screen are udnerwater
    this.maskTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );
    this.maskTarget.texture.format = THREE.RGBFormat;
    this.maskTarget.texture.minFilter = THREE.NearestFilter;
    this.maskTarget.texture.magFilter = THREE.NearestFilter;
    this.maskTarget.texture.generateMipmaps = false;
    this.maskTarget.stencilBuffer = false;

    // Used to apply the distortion effect
    this.mainTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );
    this.mainTarget.texture.format = THREE.RGBFormat;
    this.mainTarget.texture.minFilter = THREE.NearestFilter;
    this.mainTarget.texture.magFilter = THREE.NearestFilter;
    this.mainTarget.texture.generateMipmaps = false;
    this.mainTarget.stencilBuffer = false;
    var water_geometry = new THREE.PlaneGeometry(45, 25, 30, 30);
    var water_material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: Floor.WaterShader.vertexShader,
      fragmentShader: Floor.WaterShader.fragmentShader,
      transparent: true,
      depthWrite: false,
    });
    this.water = new THREE.Mesh(water_geometry, water_material);
    this.water.position.y = -0.2;
    this.water.position.z = -3;
    this.water.rotation.x = -Math.PI / 2;
    this.scene.add(this.water);
  }
  update() {
    var time = this.clock.getElapsedTime();

    this.water.material.uniforms.uTime.value +=
      0.03 * Math.sin(0.2 * time) + 0.01 * Math.sin(1 * time);
    this.experience.world?.room?.buoyantObjects.forEach((obj) => {
      this.BuoyancyUpdate(obj);
    });
  }
  resize() {
    this.water.material.uniforms.uScreenSize.value.set(
      window.innerWidth,
      window.innerHeight,
      1 / window.innerWidth,
      1 / window.innerHeight
    );
  }
  BuoyancyUpdate(obj) {
    if (obj == undefined) return;
    if (obj.time == undefined) {
      obj.time = Math.random() * Math.PI * 2;
      obj.initialPosition = obj.position.clone();
      obj.initialRotation = obj.rotation.clone();
    }

    obj.time += 0.05;
    // Move object up and down
    obj.position.y = obj.initialPosition.y + Math.cos(obj.time) * 0.06;

    // Rotate object slightly
    obj.rotation.x = obj.initialRotation.x + Math.cos(obj.time * 0.25) * 0.02;
    obj.rotation.y =
      obj.initialRotation.y + Math.sin(obj.time * 0.5) * 2 * 0.04;
    obj.rotation.z =
      obj.initialRotation.z + Math.sin(obj.time * 0.75) * 2 * 0.04;
  }
}

Floor.WaterShader = {
  fragmentShader: `
  #include <common>
  #include <fog_pars_fragment>
  #include <packing>

  varying vec2 vUV;
  varying vec3 WorldPosition;
  uniform sampler2D uSurfaceTexture;
  uniform sampler2D uDepthMap;
  uniform sampler2D uDepthMap2;
  uniform float uTime;
  uniform float cameraNear;
  uniform float cameraFar;
  uniform vec4 uScreenSize;
  uniform bool isMask;
  uniform bool isNight;
  uniform vec2 resolution;
  float readDepth (vec2 screenPosition) {
    return unpackRGBAToDepth( texture2D( uDepthMap, screenPosition ) );
  }

  float getLinearScreenDepth(const in float depth) {
    return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );

  }

  void main(){
    vec2 screenUV = gl_FragCoord.xy / resolution;

    vec4 color = vec4(0.035, 0.258, 0.95,0.65);
    vec4 foamColor = vec4(1.0, 1.0, 1.0, 0.55);
    if (isNight == true) {color = vec4(0.005, 0.027, 0.053, 0.75);};
    vec2 pos = vUV * 15.0;
      pos.y -= uTime * 0.005;
    vec4 WaterLines = texture2D(uSurfaceTexture,pos);
    if (isNight == true) color.rgba += WaterLines.r * 0.002;
        else color.rgba += WaterLines.r * 0.02;

    //float worldDepth = getLinearDepth(WorldPosition);
    float worldDepth = getLinearScreenDepth( gl_FragCoord.z );
    float screenDepth = getLinearScreenDepth( readDepth( screenUV ) );
    float diff =  worldDepth - screenDepth;

    //  vec2 displacement = texture2D( uSurfaceTexture, ( vUv * 2.0 ) - uTime * 0.05 );
    // displacement = ( ( displacement * 2.0 ) - 1.0 ) * 1.0;
    // diff += displacement.x;

    if(isMask){
      color = vec4(1.0);
    }
    gl_FragColor.rgba= mix( foamColor, color, step( diff-1.0, diff ) );
    #include <tonemapping_fragment>
    #include <encodings_fragment>

    #include <fog_fragment>
  } 
  `,
  vertexShader: `
				uniform float uTime;
				varying vec2 vUV;
				varying vec3 WorldPosition;
				void main() {
					vec3 pos = position;
					pos.z += cos(pos.x*5.0+uTime) * 0.1 * sin(pos.y * 6.0 + uTime);
					WorldPosition = pos;
					vUV = uv;
					//gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
					gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
				}
				`,
};
