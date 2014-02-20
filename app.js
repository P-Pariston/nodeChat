//Config file
require('./config/config.js');

//nodeChat version
console.log('nodeChat version: '+VERSION)

//Dependencies
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
	console.log('Server started at http://localhost:' + PORT);
});

/*
 * Function to get the hour.
 * Will be transfered by sockets
 */
function getTime(){

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
 * This function delete a pseudo in the array
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

var User = (function(){

})

    /*
     * To send a reply
     */

User.prototype.sendReply = function(reply){
    io.sockets.on('connection', function(socket){
        socket.emit('reply', reply);
    });
};

var User = new User();

// If someone is connecting
io.sockets.on('connection', function(socket){
    /******** SYSTEM COMMAND (DEV) ************/
    var Command = (function(){
        //----
    });
    Command.prototype.parser = function(c, c2, c3, c4){
        console.log('Executing command '+c+' (eventually with these args:'+c2+', '+c3+', '+c4);
        switch (c) {
            case '/hour': 
            socket.emit('reply', current_hour);
            break;
			case '/version':
            socket.emit('reply', 'nodeChat v'+VERSION);
            break;
            case '/ban':
             /*
             *Code of '/ban' here
             */
            socket.emit('reply', 'User '+c2+' was banned.');
            break;
            case '/kick':
            /*
             *Code of '/kick' here
             */
            socket.emit('reply', 'User '+c2+' was kicked.');
            break;
            case '/register':
            MongoClient.connect('mongodb://127.0.0.1:27017/nodechat', function(err, db) {
             if(err) throw err;
                var collection = db.collection('nodechat');
                /*
                 * Rank: 4 - Normal user | 3 - Voiced
                 *       2 - Moderator   | 1 - Admin
                 */
                collection.insert({username: c2, password: c3, rank: 4}, function(err, docs) {
                db.close();
                });
              })
            break;
            case '/login':
            if(typeof c2 != "undefined" && typeof c3 != "undefined"){
	            //Login code...
	            
	            socket.emit('reply', 'Successfully connected with the username: '+c2+' and the password: '+c3);
        	}else{
        		socket.emit('reply', 'Wrong username/password combinaison.');
        	}
            break;
            default:
            socket.emit('reply', 'Invalid command.');            
        }
    }
    var Command = new Command();
    /******** SYSTEM COMMAND (DEV) ************/
    //1: connected to the server
    socket.emit('connected', '1');

	/* Connection/disconnection of the user
	 * Storing logins in the array 'users'
	 */
    socket.on('username', function (pseudo) {
    	server_username = pseudo; //To prevent changing nickname from the client
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
	current_hour = getTime();
     if(mess.message.charAt(0) == "/"){
        c = mess.message; 
        /*
         * Spliting command for the commands kick or ban:
         * Example: c[0] is the command: '/ban' 
         * Others arguments are: c[1], c[2] and c[3]
         */
        c = c.split(' '); 
        Command.parser(c[0], c[1], c[2], c[3]);
	    }else if(mess.pseudo.substring(0,5) === "Guest"){
	    	//Guests cannot talk
	    	socket.emit('reply', 'You are connected as a guest and you cannot talk in this chat.')
	    }
        else{
        mess.pseudo = server_username;
    	mess.hour = current_hour;
    	messages.push(mess);
    	socket.emit('getNewPosts', mess);	
    	socket.broadcast.emit('getNewPosts', mess);		
    	}
	});
})

User.sendReply('Connected !');
User.sendReply('Welcome to nodeChat '+VERSION+' ! nodeChat is an open source application, you can fork me on <a href="https://github.com/P-Pariston/">github</a>.');
