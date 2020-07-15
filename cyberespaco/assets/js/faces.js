
import * as THREE from 'https://threejs.org/build/three.module.js';

//import Stats from './jsm/libs/stats.module.js';

import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';

var camera, scene, renderer, element; //, stats;

init();
animate();

function init() {

	element = document.getElementById("threebanner");
	console.log(element);
	console.log("width: ", element.innerWidth);
	console.log("height: ", element.innerHeight);

	camera = new THREE.PerspectiveCamera( 27, element.innerWidth / element.innerHeight, 0.1, 100 );
	camera.position.z = 20;

	scene = new THREE.Scene();

	var loader = new GLTFLoader();
	loader.load( 'https://threejs.org/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb', function ( gltf ) {

		var geometry = gltf.scene.children[ 0 ].geometry;

		var mesh = new THREE.Mesh( geometry, buildTwistMaterial( 2.0 ) );
		mesh.position.x = - 3.5;
		mesh.position.y = - 0.5;
		scene.add( mesh );

		var mesh = new THREE.Mesh( geometry, buildTwistMaterial( - 2.0 ) );
		mesh.position.x = 3.5;
		mesh.position.y = - 0.5;
		scene.add( mesh );

	} );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( element.innerWidth, element.innerHeight );
	element.appendChild( renderer.domElement );

	//var controls = new OrbitControls( camera, renderer.domElement );
	//controls.minDistance = 1000;
	//controls.maxDistance = 5000;

	// stats = new Stats();
	// document.body.appendChild( stats.dom );

	// EVENTS

	window.addEventListener( 'resize', onWindowResize, false );

}

function buildTwistMaterial( amount ) {

	var material = new THREE.MeshNormalMaterial();
	material.onBeforeCompile = function ( shader ) {

		shader.uniforms.time = { value: 0 };

		shader.vertexShader = 'uniform float time;\n' + shader.vertexShader;
		shader.vertexShader = shader.vertexShader.replace(
			'#include <begin_vertex>',
			[
				`float theta = sin( time + position.y ) / ${ amount.toFixed( 1 ) };`,
				'float c = cos( theta );',
				'float s = sin( theta );',
				'mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );',
				'vec3 transformed = vec3( position ) * m;',
				'vNormal = vNormal * m;'
			].join( '\n' )
		);

		material.userData.shader = shader;

	};

	// Make sure WebGLRenderer doesnt reuse a single program

	material.customProgramCacheKey = function () {

		return amount;

	};

	return material;

}

//

function onWindowResize() {
	const canvas = renderer.domElement;
	const width = canvas.innerWidth;
	const height = canvas.innerHeight;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize( width, height );

}

//

function animate() {

	requestAnimationFrame( animate );

	render();

	//stats.update();

}

function render() {

	scene.traverse( function ( child ) {

		if ( child.isMesh ) {

			const shader = child.material.userData.shader;

			if ( shader ) {

				shader.uniforms.time.value = performance.now() / 1000;

			}

		}

	} );

	renderer.render( scene, camera );

}