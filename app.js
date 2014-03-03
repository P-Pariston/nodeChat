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
res.write('Please put the client\'s files in the same directory as the server. \n');
res.end('Otherwise, please execute directly the file called index.html in the client.')
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
* This function removes a pseudo in the array
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
    //1: connected to the server
    socket.emit('connected', '1');
/******** COMMAND SYSTEM (DEV) ************/
var Command = (function(){
});
var Post = (function(){
});
Command.prototype.parser = function(c, c2, c3, c4){
    console.log('DEBUG: Executing command '+c+' (eventually with these args:'+c2+', '+c3+', '+c4);
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
        if(typeof c2 != "undefined" && typeof c3 != "undefined"){
        MongoClient.connect('mongodb://127.0.0.1:27017/nodechat', function(err, db) {
         if(err) throw err;
            var collection = db.collection('nodechat');
            /*
             * Rank: 6 - Muted/banned| 5 - Guest
             *       4 - Normal user | 3 - Voiced
             *       2 - Moderator   | 1 - Admin
             */
            var collection = db.collection('nodechat');
            collection.findOne({username: c2.toLowerCase()}, function(err, result){
                if(result == null){
                    collection.insert({username: c2.toLowerCase(), password: c3, rank:4}, function(err, result){
                        socket.emit('reply', 'Successfully registered.');
                    });
                    db.close();
                }else{
                    socket.emit('reply', 'Name taken.');
                }
            });
        });
        }else{
            socket.emit('reply', 'Invalid arguments.');
        }
        break;
        case '/login':
         if(typeof c2 != "undefined" && typeof c3 != "undefined"){
                //Login code...
                MongoClient.connect('mongodb://127.0.0.1:27017/nodechat', function(err, db) {
                 if(err) throw err;
                    var collection = db.collection('nodechat');
                    /*
                     * c2 = username
                     * c3 = password
                     */
                    collection.findOne({username: c2.toLowerCase()}, function(err, result) {
                        if(result == null){
                            socket.emit('reply', 'User '+c2+' doesn\'t exist.');
                        }else if(c3 == result.password){
                            socket.emit('reply', 'Right password.');                            
                        }else{
                            socket.emit('reply', 'Wrong password.');                            
                        }
                        db.close();
                    });
                  })
                }else{
                    socket.emit('reply', 'Invalid arguments.');
                }
        break;
        case '/nick':
        //rename command
        break;
        default:
        socket.emit('reply', 'Invalid command.');            
    }
}
/******** COMMAND SYSTEM (DEV) ************/

Post.prototype.newPosts = function(username, mess, hour){
    mess.pseudo = username;
    mess.hour = hour;
    messages.push(mess);
    socket.emit('getNewPosts', mess);   
    socket.broadcast.emit('getNewPosts', mess);
}
Post.prototype.displayMessages = function(messages){
    socket.emit('getPosts', messages);
}
Post.prototype.username = function(username){
    users.push(username);
    socket.emit('addUsername', username);
    socket.broadcast.emit('addUsername', username); 
    socket.emit('userlist', users);
    socket.broadcast.emit('userlist', users);
}
Post.prototype.disconnect = function(pseudo){
    socket.broadcast.emit('removeUsername', pseudo);
    users = unset(users, pseudo);
    socket.emit('userlist', users.pseudo);
    socket.broadcast.emit('userlist', users);
}
var Post = new Post();
var Command = new Command();

socket.on('username', function (pseudo) {
    Post.username(pseudo);
socket.on('disconnect', function() {
    Post.disconnect(pseudo);
    });
}); 

//To send all messages of the array to the client.
Post.displayMessages(messages);

socket.on('newPost', function (mess){
current_hour = getTime();
 if(mess.message.charAt(0) == "/"){
    c = mess.message; 
    /*
     * Spliting string for some commands:
     * Example: c[0] is the command: '/ban' 
     * c[1], c[2] and c[3] are the arguments
     */
    c = c.split(' '); 
    Command.parser(c[0], c[1], c[2], c[3]);
    }else if(mess.pseudo.substring(0,5) === "Guest"){
        //Guests cannot talk
        socket.emit('reply', 'You are connected as a guest and you cannot talk in this chat.')
    }
    else{
    Post.newPosts(mess.pseudo, mess ,current_hour);     
    }
});
})

User.sendReply('Connected !');
User.sendReply('Welcome to nodeChat '+VERSION+' ! nodeChat is an open source application, you can fork me on <a href="https://github.com/P-Pariston/" target="_blank">github</a>.');
