// import {
//   Clock,
//   Color,
//   Matrix4,
//   Mesh,
//   RepeatWrapping,
//   ShaderMaterial,
//   TextureLoader,
//   UniformsLib,
//   UniformsUtils,
//   Vector2,
//   Vector4,
// } from "three";
// import { Reflector } from "./Reflector_modified";
// import { Refractor } from "./Refractor_modified";
// import utils from "./utils.glsl.js";

// /**
//  * References:
//  *	https://alex.vlachos.com/graphics/Vlachos-SIGGRAPH10-WaterFlow.pdf
//  *	http://graphicsrunner.blogspot.de/2010/08/water-using-flow-maps.html
//  *
//  */

// class Water extends Mesh {
//   constructor(geometry, options = {}) {
//     super(geometry);

//     this.isWater = true;

//     this.type = "Water";

//     const scope = this;

//     const color =
//       options.color !== undefined
//         ? new Color(options.color)
//         : new Color(0xffffff);
//     const textureWidth = options.textureWidth || 512;
//     const textureHeight = options.textureHeight || 512;
//     const clipBias = options.clipBias || 0;
//     const flowDirection = options.flowDirection || new Vector2(1, 0);
//     const flowSpeed = options.flowSpeed || 0.03;
//     const reflectivity = options.reflectivity || 0.02;
//     const scale = options.scale || 1;
//     const shader = options.shader || Water.WaterShader;

//     const textureLoader = new TextureLoader();

//     const flowMap = options.flowMap || undefined;
//     const normalMap0 =
//       options.normalMap0 ||
//       textureLoader.load("textures/water/Water_1_M_Normal.jpg");
//     const normalMap1 =
//       options.normalMap1 ||
//       textureLoader.load("textures/water/Water_2_M_Normal.jpg");

//     const cycle = 0.5; // a cycle of a flow map phase
//     const halfCycle = cycle * 0.5;
//     const textureMatrix = new Matrix4();
//     const clock = new Clock();

//     // internal components

//     if (Reflector === undefined) {
//       console.error("THREE.Water: Required component Reflector not found.");
//       return;
//     }

//     if (Refractor === undefined) {
//       console.error("THREE.Water: Required component Refractor not found.");
//       return;
//     }

//     const reflector = new Reflector(geometry, {
//       textureWidth: textureWidth,
//       textureHeight: textureHeight,
//       clipBias: clipBias,
//     });

//     const refractor = new Refractor(geometry, {
//       textureWidth: textureWidth,
//       textureHeight: textureHeight,
//       clipBias: clipBias,
//     });

//     reflector.matrixAutoUpdate = false;
//     refractor.matrixAutoUpdate = false;

//     // material

//     this.material = new ShaderMaterial({
//       uniforms: UniformsUtils.merge([UniformsLib["fog"], shader.uniforms]),
//       vertexShader: shader.vertexShader,
//       fragmentShader: shader.fragmentShader,
//       transparent: true,
//       fog: true,
//     });

//     if (flowMap !== undefined) {
//       this.material.defines.USE_FLOWMAP = "";
//       this.material.uniforms["tFlowMap"] = {
//         type: "t",
//         value: flowMap,
//       };
//     } else {
//       this.material.uniforms["flowDirection"] = {
//         type: "v2",
//         value: flowDirection,
//       };
//     }

//     // maps

//     normalMap0.wrapS = normalMap0.wrapT = RepeatWrapping;
//     normalMap1.wrapS = normalMap1.wrapT = RepeatWrapping;

//     this.material.uniforms["tReflectionMap"].value =
//       reflector.getRenderTarget().texture;
//     this.material.uniforms["tRefractionMap"].value =
//       refractor.getRenderTarget().texture;
//     this.material.uniforms["tNormalMap0"].value = normalMap0;
//     this.material.uniforms["tNormalMap1"].value = normalMap1;

//     // water

//     this.material.uniforms["color"].value = color;
//     this.material.uniforms["reflectivity"].value = reflectivity;
//     this.material.uniforms["textureMatrix"].value = textureMatrix;

//     // inital values

//     this.material.uniforms["config"].value.x = 0; // flowMapOffset0
//     this.material.uniforms["config"].value.y = halfCycle; // flowMapOffset1
//     this.material.uniforms["config"].value.z = halfCycle; // halfCycle
//     this.material.uniforms["config"].value.w = scale; // scale

//     // functions

//     function updateTextureMatrix(camera) {
//       textureMatrix.set(
//         0.5,
//         0.0,
//         0.0,
//         0.5,
//         0.0,
//         0.5,
//         0.0,
//         0.5,
//         0.0,
//         0.0,
//         0.5,
//         0.5,
//         0.0,
//         0.0,
//         0.0,
//         1.0
//       );

//       textureMatrix.multiply(camera.projectionMatrix);
//       textureMatrix.multiply(camera.matrixWorldInverse);
//       textureMatrix.multiply(scope.matrixWorld);
//     }

//     function updateFlow() {
//       const delta = clock.getDelta();
//       const config = scope.material.uniforms["config"];

//       config.value.x += flowSpeed * delta; // flowMapOffset0
//       config.value.y = config.value.x + halfCycle; // flowMapOffset1

//       // Important: The distance between offsets should be always the value of "halfCycle".
//       // Moreover, both offsets should be in the range of [ 0, cycle ].
//       // This approach ensures a smooth water flow and avoids "reset" effects.

//       if (config.value.x >= cycle) {
//         config.value.x = 0;
//         config.value.y = halfCycle;
//       } else if (config.value.y >= cycle) {
//         config.value.y = config.value.y - cycle;
//       }
//     }

//     //

//     this.onBeforeRender = function (renderer, scene, camera) {
//       updateTextureMatrix(camera);
//       updateFlow();

//       scope.visible = false;

//       reflector.matrixWorld.copy(scope.matrixWorld);
//       refractor.matrixWorld.copy(scope.matrixWorld);

//       reflector.onBeforeRender(renderer, scene, camera);
//       refractor.onBeforeRender(renderer, scene, camera);

//       scope.visible = true;
//     };
//   }
// }

// Water.WaterShader = {
//   uniforms: {
//     color: {
//       type: "c",
//       value: null,
//     },

//     reflectivity: {
//       type: "f",
//       value: 0,
//     },

//     tReflectionMap: {
//       type: "t",
//       value: null,
//     },

//     tRefractionMap: {
//       type: "t",
//       value: null,
//     },

//     tNormalMap0: {
//       type: "t",
//       value: null,
//     },

//     tNormalMap1: {
//       type: "t",
//       value: null,
//     },

//     textureMatrix: {
//       type: "m4",
//       value: null,
//     },

//     config: {
//       type: "v4",
//       value: new Vector4(),
//     },
//   },

//   vertexShader: /* glsl */ `

//     uniform mat4 projectionMatrix;
//     uniform mat4 modelViewMatrix;
//     uniform sampler2D water;

//     attribute vec3 position;

//     varying vec3 eye;
//     varying vec3 pos;

//     void main() {
//     vec4 info = texture2D(water, position.xy * 0.5 + 0.5);
//     pos = position.xzy;
//     pos.y += info.r;

//     vec3 axis_x = vec3(modelViewMatrix[0].x, modelViewMatrix[0].y, modelViewMatrix[0].z);
//     vec3 axis_y = vec3(modelViewMatrix[1].x, modelViewMatrix[1].y, modelViewMatrix[1].z);
//     vec3 axis_z = vec3(modelViewMatrix[2].x, modelViewMatrix[2].y, modelViewMatrix[2].z);
//     vec3 offset = vec3(modelViewMatrix[3].x, modelViewMatrix[3].y, modelViewMatrix[3].z);

//     eye = vec3(dot(-offset, axis_x), dot(-offset, axis_y), dot(-offset, axis_z));

//     gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
//     }`,

//   fragmentShader: /* glsl */ `

// 		precision highp float;
// precision highp int;

// const float IOR_AIR = 1.0;
// const float IOR_WATER = 1.333;

// const vec3 abovewaterColor = vec3(0.25, 1.0, 1.25);
// const vec3 underwaterColor = vec3(0.4, 0.9, 1.0);

// const float poolHeight = 1.0;

// uniform vec3 light;
// uniform sampler2D tiles;
// uniform sampler2D causticTex;
// uniform sampler2D water;

// vec2 intersectCube(vec3 origin, vec3 ray, vec3 cubeMin, vec3 cubeMax) {
//   vec3 tMin = (cubeMin - origin) / ray;
//   vec3 tMax = (cubeMax - origin) / ray;
//   vec3 t1 = min(tMin, tMax);
//   vec3 t2 = max(tMin, tMax);
//   float tNear = max(max(t1.x, t1.y), t1.z);
//   float tFar = min(min(t2.x, t2.y), t2.z);
//   return vec2(tNear, tFar);
// }

// vec3 getWallColor(vec3 point) {
//   float scale = 0.5;

//   vec3 wallColor;
//   vec3 normal;
//   if (abs(point.x) > 0.999) {
//     wallColor = texture2D(tiles, point.yz * 0.5 + vec2(1.0, 0.5)).rgb;
//     normal = vec3(-point.x, 0.0, 0.0);
//   } else if (abs(point.z) > 0.999) {
//     wallColor = texture2D(tiles, point.yx * 0.5 + vec2(1.0, 0.5)).rgb;
//     normal = vec3(0.0, 0.0, -point.z);
//   } else {
//     wallColor = texture2D(tiles, point.xz * 0.5 + 0.5).rgb;
//     normal = vec3(0.0, 1.0, 0.0);
//   }

//   scale /= length(point); /* pool ambient occlusion */

//   /* caustics */
//   vec3 refractedLight = -refract(-light, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);
//   float diffuse = max(0.0, dot(refractedLight, normal));
//   vec4 info = texture2D(water, point.xz * 0.5 + 0.5);
//   if (point.y < info.r) {
//     vec4 caustic = texture2D(causticTex, 0.75 * (point.xz - point.y * refractedLight.xz / refractedLight.y) * 0.5 + 0.5);
//     scale += diffuse * caustic.r * 2.0 * caustic.g;
//   } else {
//     /* shadow for the rim of the pool */
//     vec2 t = intersectCube(point, refractedLight, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));
//     diffuse *= 1.0 / (1.0 + exp(-200.0 / (1.0 + 10.0 * (t.y - t.x)) * (point.y + refractedLight.y * t.y - 2.0 / 12.0)));

//     scale += diffuse * 0.5;
//   }

//   return wallColor * scale;
// }
// uniform float underwater;

// varying vec3 eye;
// varying vec3 pos;

// vec3 getSurfaceRayColor(vec3 origin, vec3 ray, vec3 waterColor) {
//   vec3 color;

//   if (ray.y < 0.0) {
//     vec2 t = intersectCube(origin, ray, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));
//     color = getWallColor(origin + ray * t.y);
//   } else {
//     vec2 t = intersectCube(origin, ray, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));
//     vec3 hit = origin + ray * t.y;
//     if (hit.y < 7.0 / 12.0) {
//       color = getWallColor(hit);
//     } else {
//       color += 0.01 * vec3(pow(max(0.0, dot(light, ray)), 20.0)) * vec3(10.0, 8.0, 6.0);
//     }
//   }

//   if (ray.y < 0.0) color *= waterColor;

//   return color;
// }

// void main() {
//   vec2 coord = pos.xz * 0.5 + 0.5;
//   vec4 info = texture2D(water, coord);

//   /* make water look more "peaked" */
//   for (int i = 0; i < 5; i++) {
//     coord += info.ba * 0.005;
//     info = texture2D(water, coord);
//   }

//   vec3 normal = vec3(info.b, sqrt(1.0 - dot(info.ba, info.ba)), info.a);
//   vec3 incomingRay = normalize(pos - eye);

//   if (underwater == 1.) {
//     normal = -normal;
//     vec3 reflectedRay = reflect(incomingRay, normal);
//     vec3 refractedRay = refract(incomingRay, normal, IOR_WATER / IOR_AIR);
//     float fresnel = mix(0.5, 1.0, pow(1.0 - dot(normal, -incomingRay), 3.0));

//     vec3 reflectedColor = getSurfaceRayColor(pos, reflectedRay, underwaterColor);
//     vec3 refractedColor = getSurfaceRayColor(pos, refractedRay, vec3(1.0)) * vec3(0.8, 1.0, 1.1);

//     gl_FragColor = vec4(mix(reflectedColor, refractedColor, (1.0 - fresnel) * length(refractedRay)), 1.0);
//   } else {
//     vec3 reflectedRay = reflect(incomingRay, normal);
//     vec3 refractedRay = refract(incomingRay, normal, IOR_AIR / IOR_WATER);
//     float fresnel = mix(0.25, 1.0, pow(1.0 - dot(normal, -incomingRay), 3.0));

//     vec3 reflectedColor = getSurfaceRayColor(pos, reflectedRay, abovewaterColor);
//     vec3 refractedColor = getSurfaceRayColor(pos, refractedRay, abovewaterColor);

//     gl_FragColor = vec4(mix(refractedColor, reflectedColor, fresnel), 1.0);
//   }
// }`,
// };

// export { Water };
