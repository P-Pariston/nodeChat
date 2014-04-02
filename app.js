/*
 * Main file
 * This is the main nodeChat app and the file you should
 * be running to start the server if you're using it normally.
 * 
 * @license MIT license
 */

//Config file
require('./config/config.js');
require('colors');

//nodeChat version
console.log('|-----------------------------|'.yellow)
console.log('|nodeChat version: '.yellow + VERSION.green + '      |'.yellow)
console.log('|-----------------------------|'.yellow)

//Dependencies
var express = require('express'),
app = express(),
http = require('http'),
server = require('http').createServer(app),
io = require('socket.io'),
url = require('url'),
MongoClient = require('mongodb').MongoClient,
format = require('util').format;

/*
 * Listening application (socket.io)
 */
var io = io.listen(server);

/*
 * App configuration
 */
app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.static(__dirname + ''));
});

/*
 * App routes
 */
app.get('index.html', function(req, res) {
});

/*
 * Listening port
 */
server.listen(PORT, function() {
    console.log('Server started at http://localhost:' + PORT);
});

/*
 * Function to get the hour.
 * Will be transfered by sockets
 */

function getTime() {

    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0": "") + hour;
    var min = date.getMinutes();
    min = (min < 10 ? "0": "") + min;
    var sec = date.getSeconds();
    sec = (sec < 10 ? "0": "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0": "") + month;
    var day = date.getDate();
    day = (day < 10 ? "0": "") + day;
    return "[" + hour + ":" + min + ":" + sec + "]";
}

/*
 * This function removes a pseudo in the array
 * For example: myArray = unset(myArray, entry)
 */

function unset(array, value) {
    var output = [];
    var index = array.indexOf(value)
        var j = 0;
    for (var i in array) {
        if (i != index) {
            output[j] = array[i];
            j++;
        }
    }
    return output;
}

var messages = [];

var users = [];

var User = (function() {
})

/*
 * To send a reply
 */

User.prototype.sendReply = function(reply) {
    io.sockets.on('connection', function(socket) {
        socket.emit('reply', reply);
    });
};

var User = new User();

// If someone is connecting
io.sockets.on('connection', function(socket) {
    //1: connected to the server
    socket.emit('connected', '1');
    /******** COMMAND SYSTEM (DEV) ************/
    var Command = (function() {});
    var Post = (function() {});
    Command.prototype.parser= require('commands.js')
    

    Post.prototype.newPosts = function(username, mess, hour, pw) {
        mess.pseudo = username;
        mess.hour = hour;
        mess.pw = pw;
        //Max message length = 300 chars.
        if (mess.message.length >= 300) {
            socket.emit('reply', 'Your message is too long. ( ' + mess.message.length + ' chars, and max is 300)');
        } else {
            /*
                 * Here is the checking of the identity.
                 * If someone has changed his name from the client,
                 * we can return to him an error. This verification is
                 * made for each post.
                 */
            if (typeof mess.pseudo != "undefined" && typeof mess.pw != "undefined") {
                MongoClient.connect('mongodb://127.0.0.1:27017/nodechat', function(err, db) {
                    if (err)
                        throw err;
                    var collection = db.collection('nodechat');
                    collection.findOne({
                        username: mess.pseudo.toLowerCase()
                        }, function(err, result) {
                        if (result == null) {
                            socket.emit('reply', 'Error');
                            socket.emit('isLogged', '-1');
                            socket.emit('refresh', '1');
                        } else if (mess.pw == result.password) {
                        if (result.rank == '5') {
                            socket.emit('reply', 'You are muted and you cannot talk in this chat.')
                            } else if(result.rank == '6'){
                            	socket.emit('isLogged', '2');
                            }else {
                            messages.push(mess);
                            socket.emit('getNewPosts', mess);
                            socket.broadcast.emit('getNewPosts', mess);
                            }
                        } else {
                            socket.emit('reply', 'Error');
                            socket.emit('isLogged', '0');
                            socket.emit('refresh', '1');
                        }
                        db.close();
                    });
                })
                } else {
                socket.emit('reply', 'Error');
                socket.emit('isLogged', '0');
                socket.emit('refresh', '1');
            }
            /**************************************/
            }
    }
    Post.prototype.displayMessages = function(messages) {
        socket.emit('getPosts', messages);
    }
    Post.prototype.username = function(username) {
        if (username.length >= 13) {
            socket.emit('reply', 'Your name is too long. ( ' + username.length + ' chars, and max is 13). Please choose another name.');
            socket.emit('BadName', '1');
        }
    }
    Post.prototype.disconnect = function(pseudo) {
        socket.broadcast.emit('removeUsername', pseudo);
        users = unset(users, pseudo);
        socket.emit('userlist', users.pseudo);
        socket.broadcast.emit('userlist', users);
    }
    var Post = new Post();
    var Command = new Command();

    socket.on('username', function(pseudo) {
            Post.username(pseudo);
        socket.on('disconnect', function() {
            Post.disconnect(pseudo);
        });
    });

    //To send all messages of the array to the client.
    Post.displayMessages(messages);

    socket.on('newPost', function(mess) {
        current_hour = getTime();
        if (mess.message.charAt(0) == "/") {
            c = mess.message;
            	/*
                 * Spliting string for some commands:
                 * Example: c[0] is the command: '/ban' 
                 * c[1], c[2] and c[3] are arguments.
                 * This system will be improved (with spliting by ',' for example:
                 * /ban user1, reason)
                 */
            c = c.split(' ');
            Command.parser(c[0], c[1], c[2], c[3], mess.pseudo);
        } else {
            Post.newPosts(mess.pseudo, mess, current_hour, mess.password);
        }
    });
})

User.sendReply('Welcome to nodeChat ' + VERSION + ' ! nodeChat is an open source application, you can fork me on <a href="https://github.com/P-Pariston/" target="_blank">github</a>.');
