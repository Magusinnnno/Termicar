var Pantalla = {		
	scene: null, camera: null, renderer: null,
	container: null, controls: null,
	clock: null, stats: null, esfera: null,
	anell: null, cube: null,
	
	init: function() {

		// Create main scene
		this.scene = new THREE.Scene();
		this.scene.fog = new THREE.FogExp2(0xc8e0ff, 0.0003);

		var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;

		// Prepare perspective camera
		var VIEW_ANGLE = 75, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 1000;
		this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
		this.scene.add(this.camera);
		this.camera.position.set(100, 0, 0);
		this.camera.lookAt(new THREE.Vector3(0,0,0));

		// Prepare webgl renderer
		this.renderer = new THREE.WebGLRenderer({ antialias:true });
		this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
		this.renderer.setClearColor(this.scene.fog.color);

		// Prepare container
		this.container = document.createElement('div');
		document.body.appendChild(this.container);
		this.container.appendChild(this.renderer.domElement);

		// Events
		THREEx.WindowResize(this.renderer, this.camera);

		// Prepare Orbit controls
		this.controls = new THREE.OrbitControls(this.camera);
		this.controls.target = new THREE.Vector3(0, 0, 0);
		this.controls.maxDistance = 150;

		// Prepare clock
		this.clock = new THREE.Clock();

		// Prepare stats
		this.stats = new Stats();
		this.stats.domElement.style.position = 'absolute';
		this.stats.domElement.style.left = '50px';
		this.stats.domElement.style.bottom = '50px';
		this.stats.domElement.style.zIndex = 1;
		this.container.appendChild( this.stats.domElement );

		// Add lights
		var pointLight = new THREE.PointLight( 0xFFFFFF );
		pointLight.position.x = 5;
		pointLight.position.y = 5;
		pointLight.position.z = 3;
		this.scene.add( pointLight );
		
		pointLight = new THREE.PointLight( 0xFFFFFF );
		pointLight.position.x = -5;
		pointLight.position.y = 5;
		pointLight.position.z = 3;
		this.scene.add( pointLight );
		
		pointLight = new THREE.PointLight( 0xFFFFFF );
		pointLight.position.x = 0;
		pointLight.position.y = -5;
		pointLight.position.z = 3;
		this.scene.add( pointLight );
		
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
		
		this.scene.add( this.cube );
		this.scene.add( this.esfera );
		this.scene.add( this.anell );
		
		this.esfera.position.x=4;
		this.cube.position.x=-4;
		this.camera.position.z = 5;
		
		// Load Json model
		//this.loadJsonModel();

		// Load Dae model
		var pos = (-4, -1, -2.5);
		this.loadDaeModel('models/robot.dae', pos, 0.7); //(-4, -1, -2.5)
		pos = (4, -1, -2.5);
		this.loadDaeModel('models/home.dae', pos, 0.7); //(4, -1, -2.5)
		pos = (0, -1, -4.5)
		this.loadDaeModel('models/cotxe.dae', pos, 8); //(0, -1, -2.5)
	},
	loadJsonModel: function() {

		// Prepare JSONLoader
		var jsonLoader = new THREE.JSONLoader();
		jsonLoader.load('models/Home.json', function(geometry, materials) {

			materials.forEach(function(mat) {
				mat.skinning = true;
			});

			// Prepare SkinnedMesh with MeshFaceMaterial (using original texture)
			var modelMesh = new THREE.SkinnedMesh(
				geometry, new THREE.MeshFaceMaterial(materials)
			);

			// Set position and scale
			var scale = 40;
			modelMesh.position.set(0, -1, -2.5);
			modelMesh.scale.set(scale, scale, scale);

			// Prepare animation
			// var animation = new THREE.Animation(
				// modelMesh, geometry.animations[0],
				// THREE.AnimationHandler.CATMULLROM
			// );

			// Add the mesh and play the animation
			Pantalla.scene.add(modelMesh);
			//animation.play();
		});

	},
	loadDaeModel: function(daeLocation, pos, scale) {

		// Prepare ColladaLoader
		var daeLoader = new THREE.ColladaLoader();
		daeLoader.options.convertUpAxis = true;
		daeLoader.load(daeLocation, function(collada) {

			var modelMesh = collada.scene;

			// Prepare and play animation
			modelMesh.traverse( function (child) {
				if (child instanceof THREE.SkinnedMesh) {
					var animation = new THREE.Animation(child, child.geometry.animation);
					animation.play();
				}
			});

			// Set position and scale
			modelMesh.position.set(pos);
			modelMesh.scale.set(scale, scale, scale);

			// Add the mesh into scene
			Pantalla.scene.add(modelMesh);
		});

	}
};

// Animate the scene
function animate() {
  requestAnimationFrame(animate);
  render();
  update();
}

function update() {
  var delta = Pantalla.clock.getDelta();

  Pantalla.controls.update(delta);
  Pantalla.stats.update();

  //THREE.AnimationHandler.update(delta);
}

// Render the scene
function render () {
		if (Pantalla.renderer) {
			Pantalla.renderer.render(Pantalla.scene, Pantalla.camera);
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
  animate();
}

if (window.addEventListener)
  window.addEventListener('load', initialize, false);
else if (window.attachEvent)
  window.attachEvent('onload', initialize);
else window.onload = initialize;
