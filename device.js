var admin = io.connect("http://166.78.237.67:8500");


	var camera, scene, renderer, root;
	//lights
	var light, pointLight, ambientLight;

	var clock = new THREE.Clock();

	var init = function() {

	  var container = document.getElementById("c");
	  renderer = new THREE.WebGLRenderer({antialias:true});
	  renderer.setSize( window.innerWidth, window.innerHeight );
	  container.appendChild(renderer.domElement);

	  scene = new THREE.Scene();
	  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, .1, 10000 );
	  camera.position.set( 0,0,100 );
	  scene.add(camera);

	  light = new THREE.DirectionalLight( 0xffffff );
	  light.position.set( 0, 1, 0 );
	  scene.add( light );

	  pointLight = new THREE.PointLight( 0xffffff );
	  pointLight.position.set( -20, 20, 20 );
	  scene.add( pointLight );

	  ambientLight = new THREE.AmbientLight( 0x050505 );
	  scene.add( ambientLight );

	  //global root 3D object
	  root = new THREE.Object3D();
      scene.add(root);


		
	}



	var render = function(){
		requestAnimationFrame( render );
		renderer.render( scene, camera );
	}

	var players = [];

	///////////////
	//Player object
	///////////////

	function map(value, inputMin, inputMax, outputMin, outputMax){
 		return ((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);
	}

	var Player = function(id){
		this.id = id || 0;
		this.isTouching = false;
		this.touches = [];
		this.acceleration = {};
		this.orientation = {};
		this.visualElement = new THREE.Object3D();
		//scene.add(this.visualElement);

		var geometry = new THREE.BoxGeometry(32,48,2, 1,1,1);
		var material = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: 0xdddddd, specular: 0x009900, shininess: 30 } );
		this.visualElement = new THREE.Mesh( geometry, material );

		root.add(this.visualElement);
				// var div = document.createElement("div");
		// div.id = this.id;
		// div.style.width = "320px";
		// div.style.height = "480px";
		// div.style.backgroundColor = "#555555";
		// div.style.marginLeft = "10px";
		// div.style.marginRight = "10px";
		// div.style.marginTop = "10px";
		// div.style.marginBottom = "10px";
		// div.style.display = "block";
		// div.style.float = "left";

		// var container = document.getElementById("container");
		// container.appendChild(div);

	}

	Player.prototype.updateMotion = function( newAccel ){
		this.acceleration = newAccel;
	}

	Player.prototype.updateOrientation = function( newAxies ){
		this.orientation = newAxies;
		this.visualElement.rotation.z = this.orientation.z*(Math.PI/180);
		this.visualElement.rotation.y = this.orientation.y*(Math.PI/180);
		this.visualElement.rotation.x =  this.orientation.x*(Math.PI/180);
	}




	Player.prototype.addTouch = function( id, x, y ){

		console.log("newTouch");
		if(!this.isTouching) this.isTouching = true;

		var newTouch = { id: id,
						 x: x,
						 y: y
						};
		this.touches.push( newTouch );

		// var mainDiv = document.getElementById(this.id);
		// var touchDiv = document.createElement("div");
		// touchDiv.id = id;
		// touchDiv.style.position = "absolute";
		// touchDiv.style.left = x+"px";
		// touchDiv.style.top = y+"px";
		// touchDiv.style.marginLeft = "-10px";
		// touchDiv.style.marginTop = "-10px";
		// touchDiv.style.width = "20px";
		// touchDiv.style.height = "20px";
		// touchDiv.style.backgroundColor = "#000000";
		// mainDiv.appendChild(touchDiv);

	}

	Player.prototype.moveTouch = function( id, x, y ){
		console.log("moveTouch", x, y);

		if( this.touches.length > 0 ){
			for(var i=0;i<this.touches.length;i++){
				if(id == this.touches[i].id){
					this.touches[i].x = x;
					this.touches[i].y = y;

					// var container = document.getElementById(this.id);
					// var touchDiv = document.getElementById(id);
					// container.removeChild(touchDiv);
					// touchDiv.style.left = x + "px";
					// touchDiv.style.top = y + "px";
					// container.appendChild(touchDiv);

				}else{
					console.log("cant find touch to move");
				}

			}
		}else{
		    var newTouch = { id: id,
						 	 x: x,
						 	 y: y
							};
			this.touches.push( newTouch );
		}
	}

	Player.prototype.endTouch = function( id, x, y ){

		if( this.touches.length > 0 ){
			for(var i=0;i<this.touches.length;i++){
				if(id == this.touches[i].id){
					this.touches.splice(i,1);

					// var mainDiv = document.getElementById( this.id );
					// mainDiv.removeChild( document.getElementById( id ) );

				}else{
					console.log("cant find touch to end");
				}

			}
		}

		if(!this.isTouching && this.touches.length == 0) this.isTouching = false;
	}

	admin.on('connect',function() {
		var msg = {};
		msg.admin = 1;
		admin.emit('who', msg); 
	});

	admin.on('add_player', function (data){
		//create a new player object
		console.log("add a new player");
		console.log(data);
		players.push(new Player( data.playerId ) );

	});


	admin.on('touch_start', function (data){

		console.log("received touch_start");
		console.log(data);

		if(players.length > 0){

			for(var i=0;i<players.length;i++){

				if(players[i].id == data.playerId){
					players[i].addTouch(data.touch.identifier, 
										data.touch.pageX, 
										data.touch.pageY
										);
				}else{
					console.log("cant find the player with id: "+data.playerId);
				}

			}
		}else{
			players.push(new Player( data.playerId ) );
			players[0].addTouch(data.touch.identifier, data.touch.pageX, data.touch.pageY);
		}

	});

	admin.on('move', function (data){


		console.log("received move");
		console.log(data);

		if(players.length > 0){

			for(var i=0;i<players.length;i++){

				if(players[i].id == data.playerId){
					players[i].moveTouch(data.touch.identifier, 
										 data.touch.pageX, 
										 data.touch.pageY
										);
				}else{
					console.log("cant find the player with id: "+data.playerId);
				}

			}
		}else{
			players.push(new Player( data.playerId ) );
			players[0].addTouch(data.touch.identifier, data.touch.pageX, data.touch.pageY);
		}

	});

	admin.on('touch_end', function (data){

		console.log("received touch_end");
		console.log(data);

		if(players.length > 0){

			for(var i=0;i<players.length;i++){

				if(players[i].id == data.playerId){
					players[i].endTouch(data.touch.identifier, 
										data.touch.pageX, 
										data.touch.pageY
										);
				}else{
					console.log("cant find the player with id: "+data.playerId);
				}

			}
		}

	});

	admin.on('update_motion', function (data){
		console.log("update motion for player: ", data.playerId);
		console.log(data);

		if(players.length > 0){

			for(var i=0;i<players.length;i++){

				if(players[i].id == data.playerId){
					players[i].updateMotion(data);
				}else{
					console.log("cant find the player with id: "+data.playerId);
				}

			}
		}

	});

	admin.on('update_orientation', function (data){
		console.log("update orientation for player: ", data.playerId);
		console.log(data);

		if(players.length > 0){

			for(var i=0;i<players.length;i++){

				if(players[i].id == data.playerId){
					players[i].updateOrientation(data);
				}else{
					console.log("cant find the player with id: "+data.playerId);
				}

			}
		}
	});


	admin.on('remove_player', function (data){
		if(players.length > 0){
			for(var i=0;i<players.length;i++){
				if(players[i].id == data.playerId){
					root.remove(players[i].visualElement);
					// var div  = document.getElementById("container");
					// div.removeChild( document.getElementById( players[i].id ) );
					players.splice(i,1);
					console.log(players);
				}else{
					console.log("couldn't find player to remove with id: "+data.playerId);
				}
			}
		}
	});