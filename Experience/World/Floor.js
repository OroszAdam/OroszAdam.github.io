import * as THREE from "three";
import Experience from "../Experience.js";
import { Water } from "three/addons/objects/Water2.js";
import GUI from "lil-gui";
import Theme from "../Theme.js";
import { Color } from "three";
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

    this.setWater();

    this.update();
  }
  setWater() {
    this.depthMaterial = new THREE.MeshDepthMaterial();
    this.depthMaterial.depthPacking = THREE.RGBADepthPacking;
    this.depthMaterial.blending = THREE.NoBlending;
    var dudvMap = new THREE.TextureLoader().load(
      "https://i.imgur.com/hOIsXiZ.png"
    );
    dudvMap.wrapS = dudvMap.wrapT = THREE.RepeatWrapping;
    var uniforms = {
      time: {
        value: 0,
      },
      timeMultiplier: {
        value: 0.01,
      },
      threshold: {
        value: 0.1,
      },
      tDudv: {
        value: null,
      },
      tDepth: {
        value: null,
      },
      cameraNear: {
        value: 0,
      },
      cameraFar: {
        value: 0,
      },
      resolution: {
        value: new THREE.Vector2(),
      },
      foamColor: {
        value: new THREE.Color(),
      },
      waterColor: {
        value: new THREE.Color(),
      },
    };

    this.renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth * this.experience.sizes.pixelRatio,
      window.innerHeight * this.experience.sizes.pixelRatio
    );
    this.renderTarget.texture.minFilter = THREE.NearestFilter;
    this.renderTarget.texture.magFilter = THREE.NearestFilter;
    this.renderTarget.texture.generateMipmaps = false;
    this.renderTarget.stencilBuffer = false;
    this.params = {
      foamColor: 0x65a2e8,
      waterColor: 0x086d99,
      threshold: 0.25,
    };

    this.clock = new THREE.Clock();
    this.scene.background = new THREE.Color(0x1e485e);

    var waterGeometry = new THREE.PlaneBufferGeometry(41, 25);
    var waterMaterial = new THREE.ShaderMaterial({
      defines: {
        DEPTH_PACKING: 1,
        ORTHOGRAPHIC_CAMERA: 0,
      },
      uniforms: uniforms,
      vertexShader: Floor.WaterShader.vertexShader,
      fragmentShader: Floor.WaterShader.fragmentShader,
    });

    waterMaterial.uniforms.cameraNear.value =
      this.camera.perspectiveCamera.near;
    waterMaterial.uniforms.cameraFar.value = this.camera.perspectiveCamera.far;
    waterMaterial.uniforms.resolution.value.set(
      window.innerWidth * this.experience.sizes.pixelRatio,
      window.innerHeight * this.experience.sizes.pixelRatio
    );
    waterMaterial.uniforms.tDudv.value = dudvMap;
    waterMaterial.uniforms.tDepth.value = this.renderTarget.texture;

    this.water = new THREE.Mesh(waterGeometry, waterMaterial);
    this.water.position.x = -5;
    this.water.position.y = -0.2;
    this.water.position.z = -3;
    this.water.rotation.x = -Math.PI / 2;
    this.scene.add(this.water);
  }
  update() {
    // depth pass

    this.water.visible = false; // we don't want the depth of the water
    this.scene.overrideMaterial = this.depthMaterial;

    this.renderer.renderer.setRenderTarget(this.renderTarget);
    this.renderer.renderer.render(this.scene, this.camera.perspectiveCamera);
    this.renderer.renderer.setRenderTarget(null);

    this.scene.overrideMaterial = null;
    this.water.visible = true;

    // beauty pass
    var time = this.clock.getElapsedTime();
    this.water.material.uniforms.threshold.value =
      0.2 + 0.1 * Math.sin(time * 0.2);
    this.water.material.uniforms.time.value = time;
    this.water.material.uniforms.foamColor.value.set(this.params.foamColor);
    this.water.material.uniforms.waterColor.value.set(this.params.waterColor);

    this.renderer.renderer.render(this.scene, this.camera.perspectiveCamera);
  }
  resize() {
    // We have to change the water and rendertarget resolution on screen resize
    this.renderTarget.setSize(
      window.innerWidth * this.experience.sizes.pixelRatio,
      window.innerHeight * this.experience.sizes.pixelRatio
    );
    this.water.material.uniforms.resolution.value.set(
      window.innerWidth * this.experience.sizes.pixelRatio,
      window.innerHeight * this.experience.sizes.pixelRatio
    );
  }
}

Floor.WaterShader = {
  fragmentShader: `
   #include <common>
      #include <packing>
      #include <fog_pars_fragment>

      varying vec2 vUv;
      uniform sampler2D tDepth;
      uniform sampler2D tDudv;
      uniform vec3 waterColor;
      uniform vec3 foamColor;
      uniform float cameraNear;
      uniform float cameraFar;
      uniform float time;
      uniform float timeMultiplier;
      uniform float threshold;
      uniform vec2 resolution;

      float getDepth( const in vec2 screenPosition ) {
      	#if DEPTH_PACKING == 1
      		return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
      	#else
      		return texture2D( tDepth, screenPosition ).x;
      	#endif
      }

      float getViewZ( const in float depth ) {
      	#if ORTHOGRAPHIC_CAMERA == 1
      		return orthographicDepthToViewZ( depth, cameraNear, cameraFar );
      	#else
      		return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );
      	#endif
      }

      void main() {

      	vec2 screenUV = gl_FragCoord.xy / resolution;

      	float fragmentLinearEyeDepth = getViewZ( gl_FragCoord.z );
      	float linearEyeDepth = getViewZ( getDepth( screenUV ) );

      	float diff = saturate( fragmentLinearEyeDepth - linearEyeDepth );

      	vec2 displacement = texture2D( tDudv, ( vUv * 2.0 ) - time * timeMultiplier ).rg;
      	displacement = ( ( displacement * 2.0 ) - 1.25 ) * 1.0;
      	diff += displacement.x;

      	gl_FragColor.rgb = mix( foamColor, waterColor, step( threshold, diff ) );
      	gl_FragColor.a = 1.0;

      	#include <tonemapping_fragment>
      	#include <encodings_fragment>
      	#include <fog_fragment>

      }`,
  vertexShader: `
  #include <fog_pars_vertex>

      varying vec2 vUv;

      void main() {

      	vUv = uv;

      	#include <begin_vertex>
      	#include <project_vertex>
      	#include <fog_vertex>

      }`,
};
