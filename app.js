require('./config/config.js');
var express = require('express')
    ,app = express()
    ,http = require('http')
    ,server  = require('http').createServer(app)
    ,io = require('socket.io')
    ,url = require('url')
    ,MongoClient = require('mongodb').MongoClient
    ,format = require('util').format;
/*
 * Listening application (socket.io)
 */

var io = io.listen(server);

/*
 * App configuration (if necessary...)
 */
app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/'));
});

/*
 * App routes
 */
app.get('/', function (req, res) {
  res.end('How are ya ? xd');
});

/*
 * Listening port
 */
server.listen(PORT,  function(){
	console.log('Server started at http://localhost/ with the port ' + PORT);
});

/*
 * Function to get the hour.
 * Will be transfered by sockets
 */
function getTime() {

    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return "["+hour + ":" + min + ":" + sec+"]";
}
/*
 * This delete a pseudo in the array
 * For example: myArray = unset(myArray, entry)
 */
 function unset(array, value){
    var output=[];
    var index = array.indexOf(value)
    var j = 0;
    for(var i in array){
	if (i!=index){
	output[j]=array[i];
        j++;
       }
     }
     return output;
}

var messages = [];

var users = [];

// If someone is connecting
io.sockets.on('connection', function(socket){
    //1: connected to the server
    socket.emit('connected', '1');
	/* Connection/disconnection of the user
	 * Storing logins in the array 'users'
	 */
    socket.on('username', function (pseudo) {
    users.push(pseudo);
    socket.emit('addUsername', pseudo);
    socket.broadcast.emit('addUsername', pseudo);	
    socket.emit('userlist', users);
    socket.broadcast.emit('userlist', users);
    socket.on('disconnect', function() {
	socket.broadcast.emit('removeUsername', pseudo);
	users = unset(users, pseudo);
	socket.emit('userlist', users.pseudo);
	socket.broadcast.emit('userlist', users);
   		});
    }); 
    //Storing messages in the array messages
	socket.emit('getPosts', messages);
	socket.on('newPost', function (mess){
	/* Hour in the var current_hour, we send and
	 * register it to the socket of the 'message'
	 */	
	current_hour = getTime();
        if(mess.message.charAt(0) == "/"){
            var Command = require('./commands.js');
            var c = new Command();
            c.hour(current_hour); 
        }
	else{
    	mess.hour = current_hour;
    	messages.push(mess);
    	socket.emit('getNewPosts', mess);	
    	socket.broadcast.emit('getNewPosts', mess);	
		}	
	});
})

