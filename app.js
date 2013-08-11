var fs = require('fs');
var http = require('http');
var port = 8000;

// Starting server
var app = http.createServer(function (req, res) {
    // Reading of chat.html
    fs.readFile('./chat.html', 'utf-8', function(error, content) {
        res.writeHead(200, {'Content-Type' : 'text/html'});
        res.end(content);
    });
});

// Global variable who will contain all messages
var messages = [];
//Socket io
var io = require('socket.io');
//Listen application
io = io.listen(app);

// Is someone is connecting
io.sockets.on('connection', function(socket){
	//We give the list of messages (we wreate the event in the client)
	socket.emit('recupererMessages', messages);
	// If we receive a new message
	socket.on('nouveauMessage', function(mess){
	//We add them in the global variable messages []
	messages.push(mess);
	//After that, we send it at all clients
	socket.broadcast.emit('recupererNouveauMessage', mess);	
	});
})
app.listen(port, function(){
	console.log('Le serveur est lancé à http://localhost/ au port ' + port);
});

