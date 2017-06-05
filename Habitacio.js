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

var keyboard = new KeyboardState();
var clock = new THREE.Clock();
var delta = 0;

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
	clock: null, stats: null, esfera: null, anell: null,
	cube: null, home: null, cotxe: null, robot: null,
	stop: null, cone: null, Human: null, carLow: null,
	Range: null, is_jumping:null, stopList: [], coneList: [],
	esferaList: [], HumanList: [], carLowList: [], RangeList: [],
	raycaster: null, obstacleList: [],
	
	init: function() {

		// Create main scene
		this.scene = new THREE.Scene();
		this.scene.fog = new THREE.FogExp2(0xc8e0ff, 0.0003);
		this.Raycaster = new THREE.Raycaster();
		this.WALK_SPEED=1.4;
		this.entrar=false;
		
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
		pointLight.position.x = 20;
		pointLight.position.y = 70;
		pointLight.position.z = 20;
		this.holder.add( pointLight );
		
		pointLight = new THREE.PointLight( 0xFFFFFF );
		pointLight.position.x = -20;
		pointLight.position.y = 70;
		pointLight.position.z = 20;
		this.holder.add( pointLight );
		
		pointLight = new THREE.PointLight( 0xFFFFFF );
		pointLight.position.x = -20;
		pointLight.position.y = 70;
		pointLight.position.z = -200;
		this.holder.add( pointLight );
		
		//Add texture
		var textureLoader = new THREE.TextureLoader();
		textureLoader.load('textures/ground.png', function (texture) {
			var geometry = new THREE.PlaneBufferGeometry(25, 300);
			var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
			var ground = new THREE.Mesh(geometry, material);
			ground.rotation.x = - Math.PI * 0.5;
			ground.position.z = -15;
			Pantalla.holder.add(ground);
		});
		
		// Create objects
		// var geometriaCaixa = new THREE.BoxGeometry( 1, 1, 1 );

		// var geometriaAnell = new THREE.RingGeometry( 1, 1.2, 32 );
		// var materialCaixa = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
		// var materialAnell =  new THREE.MeshLambertMaterial( { color: 0xffff00, side: THREE.DoubleSide } );

		// this.anell= new THREE.Mesh( geometriaAnell, materialAnell);
		// this.cube = new THREE.Mesh( geometriaCaixa, materialCaixa );
		
		// this.holder.add( this.cube );
		// this.holder.add( this.anell );
		
		// this.cube.position.x = -4;
		// this.cube.position.y = 4;
		// this.cube.position.z = 14;
		// this.anell.position.y = 4;
		// this.anell.position.z = -14;
		
		// Load Json model
		//this.loadJsonModel();
		
		// Create spheres
		for(var i=0;i<7;i++){
			var geometriaEsfera = new THREE.SphereGeometry(1, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
			var materialEsfera = new THREE.MeshNormalMaterial();
			var esfera = new THREE.Mesh( geometriaEsfera, materialEsfera );		
			esfera.position.z = -460+i*40;
			esfera.position.x = 600;
			esfera.position.y = 2;
			this.esferaList.push(esfera);
			this.holder.add( esfera );
		}
		
		// Load Dae models
		// Load Robot model
		var robotLoader = new THREE.ColladaLoader();
		robotLoader.options.convertUpAxis = true;
		robotLoader.load('models/robot.dae', function(collada) {
			Pantalla.robot = collada.scene;

			// Set position and scale
			Pantalla.robot.position.set(600, 1, -25.5);
			Pantalla.robot.scale.set(0.7, 0.7, 0.7);

			// Add the mesh into scene
			Pantalla.holder.add(Pantalla.robot);
		});
		
		
		// Load Stop model
		var StopLoader = new THREE.ColladaLoader();
		StopLoader.options.convertUpAxis = true;
		StopLoader.load('models/stopsin.dae', function(collada) {
			Pantalla.stop = collada.scene;

			// Set position and scale
			Pantalla.stop.rotation.y =- Math.PI / 2;
			Pantalla.stop.position.set(4, 6, 600);
			Pantalla.stop.scale.set(2,2,2);

			// Add the mesh into scene
			Pantalla.holder.add(Pantalla.stop);
		});
		
		// Load Cone model
		var ConeLoader = new THREE.ColladaLoader();
		ConeLoader.options.convertUpAxis = true;
		ConeLoader.load('models/cone.dae', function(collada) {
			Pantalla.cone = collada.scene.children[0];
			
			// Set position and scale
			// Pantalla.cone.rotation.y =- Math.PI / 2;
			Pantalla.cone.position.set(500, 2, -10.5);
			Pantalla.cone.scale.set(1.5,1.5,1.5);
			// Add the mesh into scene
			Pantalla.holder.add(Pantalla.cone);
			
			for (var i = 0; i < 3; i++) {
				var newPiece = new THREE.Object3D();

				for (var j = 0; j < Pantalla.cone.children.length; j++) {
					newPiece.add(new THREE.Mesh(Pantalla.cone.children[j].geometry, Pantalla.cone.children[j].material));
				}
			
				newPiece.position.set(-8 + i * 8, 2, 600);
				newPiece.rotation.x = Math.PI / 2;
				newPiece.scale.set(1.5,1.5,1.5);
				Pantalla.coneList.push(newPiece);
				Pantalla.holder.add(newPiece);
			}
		});
		
		// Load Human model
		var HumanLoader = new THREE.ColladaLoader();
		HumanLoader.options.convertUpAxis = true;
		HumanLoader.load('models/human_man_1.2.dae', function(collada) {
			Pantalla.Human = collada.scene;
		
			// Set position and scale
			Pantalla.Human.position.set(600, 4, -10.5);
			Pantalla.Human.scale.set(1.5,1.5,1.5);

			// Add the mesh into scene
			Pantalla.holder.add(Pantalla.Human);
		});
		
		
	   // Load Cotxe low poly model
		var carLowLoader = new THREE.ColladaLoader();
		carLowLoader.options.convertUpAxis = true;
		carLowLoader.load('models/Car.dae', function(collada) {
			Pantalla.carLow = collada.scene;

			// Set position and scale
			Pantalla.carLow.position.set(-8, 2.8, 600.0);
			Pantalla.carLow.scale.set(2.3,3.5,1.8);

			// Add the mesh into scene
			Pantalla.holder.add(Pantalla.carLow);
		});

	   // Load RangeRover model
		var RangeLoader = new THREE.ColladaLoader();
		RangeLoader.options.convertUpAxis = true;
		RangeLoader.load('models/RangeRover.dae', function(collada) {
			Pantalla.Range = collada.scene;

			// Set position and scale
			Pantalla.Range.rotation.y = Math.PI / 2;
			Pantalla.Range.position.set(4, 0.5, 600);
			Pantalla.Range.scale.set(1.2,1.2,1.2);

			// Add the mesh into scene
			Pantalla.holder.add(Pantalla.Range);
		});
		
		// Load Car model
		var cotxeLoader = new THREE.ColladaLoader();
		cotxeLoader.options.convertUpAxis = true;
		cotxeLoader.load('models/cotxeUltim.dae', function(collada) {
			Pantalla.cotxe = collada.scene;

			// Set position and scale
			Pantalla.cotxe.position.set(0, 1, 14);
			Pantalla.cotxe.rotation.y = Math.PI;
			Pantalla.cotxe.scale.set(2.5, 2.5, 2.5);

			// Add the mesh into scene
			Pantalla.holder.add(Pantalla.cotxe);
			//Pantalla.raycaster = new THREE.Raycaster(Pantalla.cotxe.position, new THREE.Vector3(0,0,-1));
		});
		
		// Moving holder
		//this.holder.rotation.x = - 15 * ( Math.PI / 180 );
		this.holder.position.y -= 10
		this.holder.position.x -= 5
		
		this.scene.add( this.holder );
		this.is_jumping = false;
	},

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

function spawn() {
	if (Math.trunc(clock.getElapsedTime()) % 5== 0 && Pantalla.entrar==false) {
		var num = Math.trunc(Math.random() * 5 + 1);
		switch(num) {
			case 1:
				for (var i = 0; i < Pantalla.coneList.length; i++) {
					Pantalla.coneList[i].position.z = -160;
				}
				break;
			case 2:
				var carril = Math.trunc(Math.random() * 2 + 1);
				if (Pantalla.Range != null) {
					switch(carril){
						case 1:
							Pantalla.Range.position.x=4
							break;
						case 2:
							Pantalla.Range.position.x=-4
							break;
						default:
							break;
					}
					Pantalla.Range.position.z = -160;
				}
				break;
			case 3:
				if (Pantalla.carLow != null) {
					var carril = Math.trunc(Math.random() * 2 + 1);
					switch(carril) {
						case 1:
							Pantalla.carLow.position.x = -8;
							break;
						case 2:
							Pantalla.carLow.position.x = 0;
							break;
						case 3:
							Pantalla.carLow.position.x = 8;
							break;
						default:
							break;
					}
					Pantalla.carLow.position.z = -160;

				}
				break;
			case 4:
				if (Pantalla.stop != null) {
					var carril = Math.trunc(Math.random() * 3 + 1);
					Pantalla.stop.position.z = -160;
					switch(carril) {
						case 1:
							Pantalla.stop.position.x = -8;
							break;
						case 2:
							Pantalla.stop.position.x = 0;
							break;
						case 3:
							Pantalla.stop.position.x = 8;
							break;
						default:
							break;
					}
				}
				break;
			case 5:
				if (Pantalla.robot != null && Pantalla.Human != null) {
					var carril = Math.trunc(Math.random() * 3 + 1);
					var carril2 = Math.trunc(Math.random() * 3 + 1);
					while (carril2 == carril) {
						carril2 = Math.trunc(Math.random() * 3 + 1);
					}
					switch(carril) {
						case 1:
							Pantalla.robot.position.x = -8;
							break;
						case 2:
							Pantalla.robot.position.x = 0;
							break;
						case 3:
							Pantalla.robot.position.x = 8;
							break;
						default:
							break;
					}
					switch(carril2) {
						case 1:
							Pantalla.Human.position.x = -8;
							break;
						case 2:
							Pantalla.Human.position.x = -2;
							break;
						case 3:
							Pantalla.Human.position.x = 5;
							break;
						default:
							break;
					}
					Pantalla.robot.position.z = -160;
					Pantalla.Human.position.z = -160;
				}
			default:
				break;
		}
		Pantalla.entrar = true;
		// if ()==1){
			// for (var i = 0; i < Pantalla.coneList.length; i++) {
				// Pantalla.coneList[i].position.z = -90;
				
			// }
			// console.log("puamerda")
			// entrar=false;
		// }
		// else{
			// if (Pantalla.Range != null) {
				// Pantalla.Range.position.z = -90;
			// }
			// entrar=false;
		// }
	}
	else if(Math.trunc(clock.getElapsedTime()) % 5 != 0){
		Pantalla.entrar=false;
	}
	/*if(Math.trunc(clock.getElapsedTime()) % 1 == 0 && Pantalla.entrar==false){
		var num = Math.trunc(Math.random() * 3 + 1);
		switch(num) {
			case 1:
				Pantalla.esfera.position.x=8;
				Pantalla.esfera.position.z=-90;
				break;
			case 2:
				Pantalla.esfera.position.x=0;
				Pantalla.esfera.position.z=-90;
				break;
			case 3:
				Pantalla.esfera.position.x=-8;
				Pantalla.esfera.position.z=-90;
				break;
			default:
				break;
		}


	}*/
}

// Saltar:
function jump() {
	new TWEEN.Tween({jump: 0}).to({jump: Math.PI}, 1000).onUpdate(function () {
			Pantalla.cotxe.position.y = 8*Math.sin(this.jump);
			if ( this.jump > 3.1 )
				Pantalla.cotxe.is_jumping = false;
			else
				Pantalla.cotxe.is_jumping = true;
		}).start();
}

// Animate the scene
function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();
  render();
  update();
}

function update() {
	var delta = Pantalla.clock.getDelta();
	// console.log('Eix X: ' + Pantalla.cotxe.position.x);
	// console.log('Eix Y: ' + Pantalla.camera.position.y);
	// console.log('Eix Z: ' + Pantalla.camera.position.z);
	// Pantalla.controls.update(delta);
	keyboard.update();

	// var moveDistance = 50 * clock.getDelta(); 

	if ( keyboard.down("right") && Pantalla.cotxe.position.x != 7 && !Pantalla.cotxe.is_jumping ) 
		Pantalla.cotxe.translateX( -7 );
		
	if ( keyboard.down("left") && Pantalla.cotxe.position.x != -7 && !Pantalla.cotxe.is_jumping ) 
		Pantalla.cotxe.translateX( 7 );
	
	if ( keyboard.down("up") && !Pantalla.cotxe.is_jumping )
		jump();
	
	if ( keyboard.down("D") && Pantalla.cotxe.position.x != 7 && !Pantalla.cotxe.is_jumping ) 
		Pantalla.cotxe.translateX( -7 );
		
	if ( keyboard.down("A") && Pantalla.cotxe.position.x != -7 && !Pantalla.cotxe.is_jumping ) 
		Pantalla.cotxe.translateX( 7 );
	
	if ( keyboard.down("W") && !Pantalla.cotxe.is_jumping)
		jump();

	// if ( keyboard.pressed("D") )
		// Pantalla.cotxe.translateX( -moveDistance );
		
	// if ( keyboard.pressed("A") )
		// Pantalla.cotxe.translateX( moveDistance );
	
	Pantalla.stats.update();
	spawn();
	
	//Translate bodies:
	for (var i = 0; i < Pantalla.coneList.length; i++) {
		Pantalla.coneList[i].position.z += Pantalla.WALK_SPEED;
	}
	if (Pantalla.Range != null) {
		Pantalla.Range.position.z+=Pantalla.WALK_SPEED;
	}
	if (Pantalla.carLow != null) {
		Pantalla.carLow.position.z+=Pantalla.WALK_SPEED;
	}
	if (Pantalla.stop != null) {
		Pantalla.stop.position.z+=Pantalla.WALK_SPEED;
	}
	if (Pantalla.robot != null) {
		Pantalla.robot.position.z+=Pantalla.WALK_SPEED;
	}
	if (Pantalla.Human != null) {
		Pantalla.Human.position.z+=Pantalla.WALK_SPEED;
	}
	for(var i=0;i<7;i++){
		if(Pantalla.esferaList[i]!=null){
			Pantalla.esferaList[i].position.z+=Pantalla.WALK_SPEED;
			if(Pantalla.esferaList[i].position.z>=+180){
				var num = Math.trunc(Math.random() * 3 + 1);
				switch(num) {
					case 1:
						Pantalla.esferaList[i].position.x=6;
						Pantalla.esferaList[i].position.z=-120;
						break;
					case 2:
						Pantalla.esferaList[i].position.x=0;
						Pantalla.esferaList[i].position.z=-120;
						break;
					case 3:
						Pantalla.esferaList[i].position.x=-6;
						Pantalla.esferaList[i].position.z=-120;
						break;
					default:
						break;
				}
			}
		}
	}
	//Calculate collisions:
	var intersects = Pantalla.Raycaster.intersectObjects( Pantalla.holder.children );
	
	for (var i = 0; i < intersects.length; i++) {
		intersects[ i ].object.material.color.set( 0xff0000 );
		console.log("He colissionat!");
	}
	
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
		
	// Pantalla.anell.rotation.x +=0.01
	// Pantalla.anell.rotation.y +=0.01
	// Pantalla.cube.rotation.x += 0.01;
	// Pantalla.cube.rotation.y += 0.01;
	// Pantalla.esfera.rotation.y += 0.01;
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
