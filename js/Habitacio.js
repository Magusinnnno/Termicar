// Global container
var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
var container = document.createElement('div');
document.body.appendChild(container);

// Global renderer
var renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
// renderer.setClearColor( 0xffffff, 1 );
renderer.setPixelRatio( window.devicePixelRatio );
container.appendChild(renderer.domElement);

// Create your background scene
var Background = {
	scene: null, camera: null, renderer: null,
	container: null, texture: null, mesh: null,
	
	init: function() {
		this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();
        this.scene.add( this.camera );
		
		this.texture = THREE.ImageUtils.loadTexture( 'textures/background.jpg' );
		this.texture.minFilter = THREE.LinearFilter;
        this.mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry(2, 2, 0), new THREE.MeshBasicMaterial({
                map: this.texture
            }));
        this.mesh.material.depthTest = false;
        this.mesh.material.depthWrite = false;
        this.scene.add( this.mesh );
	}
};
		
var Pantalla = {		
	scene: null, camera: null, holder: null, controls: null,
	clock: null, stats: null, esfera: null,
	anell: null, cube: null, home: null, 
	cotxe: null, robot: null,
	
	init: function() {

		// Create main scene
		this.scene = new THREE.Scene();
		this.scene.fog = new THREE.FogExp2(0xc8e0ff, 0.0003);
		
		// Create holder
		this.holder = new THREE.Group();
		
		// Prepare perspective camera
		var VIEW_ANGLE = 75, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 1000;
		this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
		this.scene.add(this.camera);
		this.camera.position.set(-8, 2.5, 29);
		//this.camera.position.set(0, 14.5, 24);
		this.camera.lookAt(new THREE.Vector3(0,0,0));

		// Events
		THREEx.WindowResize(renderer, this.camera);

		// Prepare Orbit controls
		// this.controls = new THREE.OrbitControls(this.camera);
		// this.controls.target = new THREE.Vector3(0, 0, 0);
		// this.controls.maxDistance = 150;

		// Prepare clock
		this.clock = new THREE.Clock();

		// Prepare stats
		this.stats = new Stats();
		this.stats.domElement.style.position = 'absolute';
		this.stats.domElement.style.left = '50px';
		this.stats.domElement.style.bottom = '50px';
		this.stats.domElement.style.zIndex = 1;
		container.appendChild( this.stats.domElement );

		// Add lights
		var pointLight = new THREE.PointLight( 0xFFFFFF );
		pointLight.position.x = 10;
		pointLight.position.y = 30;
		pointLight.position.z = 20;
		this.holder.add( pointLight );
		
		pointLight = new THREE.PointLight( 0xFFFFFF );
		pointLight.position.x = -10;
		pointLight.position.y = 30;
		pointLight.position.z = 20;
		this.holder.add( pointLight );
		
		pointLight = new THREE.PointLight( 0xFFFFFF );
		pointLight.position.x = 0;
		pointLight.position.y = 30;
		pointLight.position.z = -30;
		this.holder.add( pointLight );
		
		//Add texture
		var textureLoader = new THREE.TextureLoader();
		textureLoader.load('textures/ground.png', function (texture) {
			var geometry = new THREE.PlaneBufferGeometry(25, 100);
			var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
			var ground = new THREE.Mesh(geometry, material);
			ground.rotation.x = - Math.PI * 0.5;
			ground.position.z = -15;
			Pantalla.holder.add(ground);
		});
		
		// Create objects
		var geometriaCaixa = new THREE.BoxGeometry( 1, 1, 1 );
		var geometriaEsfera = new THREE.SphereGeometry(1, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
		var geometriaAnell = new THREE.RingGeometry( 1, 1.2, 32 );
		var materialCaixa = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
		var materialAnell =  new THREE.MeshLambertMaterial( { color: 0xffff00, side: THREE.DoubleSide } );
		var materialEsfera = new THREE.MeshNormalMaterial();
		this.esfera = new THREE.Mesh( geometriaEsfera, materialEsfera );
		this.anell= new THREE.Mesh( geometriaAnell, materialAnell);
		this.cube = new THREE.Mesh( geometriaCaixa, materialCaixa );
		
		this.holder.add( this.cube );
		this.holder.add( this.esfera );
		this.holder.add( this.anell );
		
		this.esfera.position.x = 4;
		this.esfera.position.y = 4;
		this.cube.position.x = -4;
		this.cube.position.y = 4;
		this.cube.position.z = 14;
		this.anell.position.y = 4;
		this.anell.position.z = -14;
		
		// Load Json model
		//this.loadJsonModel();

		// Load Dae model
		var k = 14;
		
		// Load Robot model
		var robotLoader = new THREE.ColladaLoader();
		robotLoader.options.convertUpAxis = true;
		robotLoader.load('models/robot.dae', function(collada) {
			Pantalla.robot = collada.scene;

			// Set position and scale
			Pantalla.robot.position.set(0, 1, -25.5);
			Pantalla.robot.scale.set(0.7, 0.7, 0.7);

			// Add the mesh into scene
			Pantalla.holder.add(Pantalla.robot);
		});
		
		// Load man model
		var homeLoader = new THREE.ColladaLoader();
		homeLoader.options.convertUpAxis = true;
		homeLoader.load('models/home.dae', function(collada) {
			Pantalla.home = collada.scene;

			// Set position and scale
			Pantalla.home.position.set(0.5, 0.7, 0.5 + k);
			Pantalla.home.rotation.y = Math.PI;
			Pantalla.home.scale.set(0.5, 0.5, 0.5);

			// Add the mesh into scene
			Pantalla.holder.add(Pantalla.home);
		});
		
		// Load Car model
		var cotxeLoader = new THREE.ColladaLoader();
		cotxeLoader.options.convertUpAxis = true;
		cotxeLoader.load('models/cotxe.dae', function(collada) {
			Pantalla.cotxe = collada.scene;

			// Set position and scale
			Pantalla.cotxe.position.set(0, 1, k);
			Pantalla.cotxe.rotation.y = Math.PI;
			Pantalla.cotxe.scale.set(2.5, 2.5, 2.5);

			// Add the mesh into scene
			Pantalla.holder.add(Pantalla.cotxe);
		});
		
		// Moving holder
		//this.holder.rotation.x = - 15 * ( Math.PI / 180 );
		this.holder.position.y -= 10
		this.holder.position.x -= 5
		
		this.scene.add( this.holder );
	}
	// loadJsonModel: function() {

		// // Prepare JSONLoader
		// var jsonLoader = new THREE.JSONLoader();
		// jsonLoader.load('models/Home.json', function(geometry, materials) {

			// materials.forEach(function(mat) {
				// mat.skinning = true;
			// });

			// // Prepare SkinnedMesh with MeshFaceMaterial (using original texture)
			// var modelMesh = new THREE.SkinnedMesh(
				// geometry, new THREE.MeshFaceMaterial(materials)
			// );

			// // Set position and scale
			// var scale = 40;
			// modelMesh.position.set(0, -1, -2.5);
			// modelMesh.scale.set(scale, scale, scale);

			// // Prepare animation
			// // var animation = new THREE.Animation(
				// // modelMesh, geometry.animations[0],
				// // THREE.AnimationHandler.CATMULLROM
			// // );

			// // Add the mesh and play the animation
			// Pantalla.holder.add(modelMesh);
			// //animation.play();
		// });

	// },
	// loadDaeModel: function(daeLocation, x, z, scale, y=1, rot=false) {

		// // Prepare ColladaLoader
		// var daeLoader = new THREE.ColladaLoader();
		// daeLoader.options.convertUpAxis = true;
		// daeLoader.load(daeLocation, function(collada) {

			// var modelMesh = collada.scene;

			// // Prepare and play animation
			// // modelMesh.traverse( function (child) {
				// // if (child instanceof THREE.SkinnedMesh) {
					// // var animation = new THREE.Animation(child, child.geometry.animation);
					// // animation.play();
				// // }
			// // });

			// // Set position and scale
			// modelMesh.position.set(x, y, z);
			// if (rot) {
				// modelMesh.rotation.y = Math.PI;
			// }
			// modelMesh.scale.set(scale, scale, scale);

			// // Add the mesh into scene
			// Pantalla.holder.add(modelMesh);
		// });

	// }
};

// Animate the scene
function animate() {
  requestAnimationFrame(animate);
  render();
  update();
}

function update() {
	var delta = Pantalla.clock.getDelta();
	// console.log('Eix X: ' + Pantalla.camera.position.x);
	// console.log('Eix Y: ' + Pantalla.camera.position.y);
	// console.log('Eix Z: ' + Pantalla.camera.position.z);
	// Pantalla.controls.update(delta);
	Pantalla.stats.update();

	//THREE.AnimationHandler.update(delta);
}

// Render the scene
function render () {
		
	if (renderer) {
		renderer.autoClear = false;
		renderer.clear();
		renderer.render(Background.scene, Background.camera);
		renderer.render(Pantalla.scene, Pantalla.camera);
	}
		
	Pantalla.anell.rotation.x +=0.01
	Pantalla.anell.rotation.y +=0.01
	Pantalla.cube.rotation.x += 0.01;
	Pantalla.cube.rotation.y += 0.01;
	Pantalla.esfera.rotation.y += 0.01;
}

// Initialize lesson on page load
function initialize() {
	Pantalla.init();
	Background.init();
	animate();
}

if (window.addEventListener)
  window.addEventListener('load', initialize, false);
else if (window.attachEvent)
  window.attachEvent('onload', initialize);
else window.onload = initialize;
