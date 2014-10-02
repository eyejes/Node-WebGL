var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var port = 8500;
server.listen(port);

// app.get('*',function(req,res){
// 	res.sendfile(__dirname + req.url);
// });

console.log("server started on port: "+port);


app.get('/', function (request, response) {
  response.sendfile(__dirname + '/index.html');
});

app.route('/admin').get(function (request, response) {
  console.log("gettting admin");
  response.sendfile(__dirname + '/admin.html');

});

app.get('/js/:script', function (request, response) {
  response.sendfile(__dirname +'/'+ request.params.script);
});
app.get('/js/lib/:library', function (request, response) {
  response.sendfile(__dirname +'/lib/'+ request.params.library);
});

var players = [];
var adminClient = null;

io.on('connection',function(socket){

	console.log('connected');

	socket.on('who', function (data){
		console.log('enter registration');
	    console.log(data);
		if(data.admin == 0){
			console.log('registering player');
			socket.isAdmin = false;

			players.push(socket);
			//socket.playerId = players.length-1;
			socket.emit('player_id', { playerId: socket.id });
			socket.emit('num_players', { numPlayers: players.length });

			if(adminClient){
				console.log("notify admin of new player with id: "+socket.id);
				adminClient.emit('add_player', { playerId: socket.id } );
			}

		}else{
			console.log('checking admin status:');
			if(!adminClient){
				console.log('registering admin');
				socket.isAdmin = true;
				adminClient = socket;

				if(players.length > 0){
					for(var i=0;i<players.length;i++){
						adminClient.emit('add_player', { playerId: players[i].id });
					}
				}


			}else{
				console.log('admin already registered');
			}
		}

	});


	socket.on('touch_start', function (data){
		
		//console.log("touch start socket id: ", socket.id);
		//console.log(data);

		if(adminClient){
			adminClient.emit('touch_start', data);
		}

	});

	socket.on('touch_end', function (data){

		//console.log("touch end socket id: ", socket.id);
		//console.log(data);

		if(adminClient){
			adminClient.emit('touch_end', data);
		}

	});

	socket.on('move', function (data){

		//console.log("move socket id: ", socket.id);
		//console.log(data);

		if(adminClient){
			adminClient.emit('move', data);
		}
	});

	socket.on('update_motion', function (data){

		//console.log("motion socket id: ", socket.id);
		//console.log(data);

		if(adminClient){
			adminClient.emit('update_motion', data);
		}

	});

	socket.on('update_orientation', function (data){

		//console.log("orientation socket id: ", socket.id);
		//console.log(data);

		if(adminClient){
			adminClient.emit('update_orientation', data);
		}

	});

	socket.on('disconnect',function(){

		console.log("enter disconnect:");
		if(socket.isAdmin){
			console.log("disconnecting admin");
			adminClient = null;
		}else{
			console.log("disconnecting player");
			if(adminClient){
				console.log("notifying admin of disconnect id: "+socket.id);
				adminClient.emit('remove_player', { playerId: socket.id } );
			}
			for(var i=0;i<players.length;i++){
				console.log("splicing player from registration...");
				if(players[i].id==socket.id){
					players.splice(i,1);
					console.log("success");
					break;
				}
			}	
		}	

	});

});
