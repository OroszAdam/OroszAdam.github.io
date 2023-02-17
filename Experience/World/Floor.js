import * as THREE from "three";
import Experience from "../Experience.js";
import { Water } from "three/addons/objects/Water2.js";
import GUI from "lil-gui";

export default class Floor {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.renderer = this.experience.renderer;
    this.camera = this.experience.camera;
    this.scene = this.experience.scene;
    this.light = this.experience.world.environment.sunLight;
    this.resources = this.experience.resources;
    this.controls = this.experience.controls;

    this.setWater();
    this.update();
  }
  setWater() {
    const groundGeometry = new THREE.PlaneGeometry(41, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.7,
      metalness: 1.1,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI * -0.5;
    ground.position.x = -5;
    ground.position.y = -0.5;
    ground.position.z = -3;
    // this.scene.add(ground);
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("textures/sandy_ground.jpg", function (map) {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = 8;
      map.repeat.set(4, 4);

      groundMaterial.map = map;
      groundMaterial.needsUpdate = true;
    });

    // setPath("textures/skybox/");
    let materialArray = [];

    materialArray.push(
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/skybox/tropic_ft.jpg"),
      })
    );
    materialArray.push(
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/skybox/tropic_bk.jpg"),
      })
    );
    materialArray.push(
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/skybox/tropic_up.jpg"),
      })
    );
    materialArray.push(
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/skybox/tropic_dn.jpg"),
      })
    );
    materialArray.push(
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/skybox/tropic_rt.jpg"),
      })
    );
    materialArray.push(
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/skybox/tropic_lf.jpg"),
      })
    );

    for (let i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide;

    let skyboxGeo = new THREE.BoxGeometry(2000, 2000, 2000);
    let skybox = new THREE.Mesh(skyboxGeo, materialArray);

    skybox.position.y = 15;
    // this.scene.add(skybox);
    this.scene.background = new THREE.Color(0x1e485e);

    // // water
    // this.waterParams = {
    //   color: "#8FDCFF",
    //   scale: 0.1,
    //   flowX: 0.15,
    //   flowY: 0.2,
    // };
    // const waterGeometry = new THREE.PlaneGeometry(41, 20);

    // this.water = new Water(waterGeometry, {
    //   color: this.waterParams.color,
    //   scale: this.waterParams.scale,
    //   flowDirection: new THREE.Vector2(
    //     this.waterParams.flowX,
    //     this.waterParams.flowY
    //   ),
    //   textureWidth: 1024,
    //   textureHeight: 1024,
    // });

    // this.water.position.x = -5;
    // this.water.position.y = -0.2;
    // this.water.position.z = -0.5;
    // this.water.rotation.x = -Math.PI / 2;
    // this.scene.add(this.water);
    this.clock = new THREE.Clock();

    // water

    this.params = {
      foamColor: 0x65a2e8,
      waterColor: 0x51af,
      threshold: 0.25,
    };

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

    var waterGeometry = new THREE.PlaneBufferGeometry(41, 20);
    var waterMaterial = new THREE.ShaderMaterial({
      defines: {
        DEPTH_PACKING: 1,
        ORTHOGRAPHIC_CAMERA: 0,
      },
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib["fog"], uniforms]),
      vertexShader: Floor.WaterShader.vertexShader,
      fragmentShader: Floor.WaterShader.fragmentShader,
      fog: true,
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
    this.water.position.z = -0.5;
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
