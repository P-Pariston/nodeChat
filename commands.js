/*
 * commands.js
 *
 * This file contains all commands of the chat.
 * You can add a command by just adding a 'case'.
 * This file is required to run nodeChat.
 * @license MIT license
 */
module.exports = function(c, c2, c3, c4, by) {
        console.log('DEBUG: Executing command ' + c + ' (eventually with these args:' + c2 + ', ' + c3 + ', ' + c4);
        switch (c) {
        case '/users':
            socket.emit('reply', users);
            break;
        case '/hour':
            socket.emit('reply', current_hour);
            break;
        case '/version':
            socket.emit('reply', 'nodeChat v' + VERSION);
            break;
        case '/ban':
            if (typeof c2 != "undefined") {
                MongoClient.connect('mongodb://127.0.0.1:27017/nodechat', function(err, db) {
                    if (err)
                        throw err;
                    var collection = db.collection('nodechat');
                    /*
                     *  c2 = username
                     */
                    //Allowed to ban ?
                    collection.findOne({
                        username: by.toLowerCase()
                        }, function(err, result) {
                        if (result == null) {
                            socket.emit('reply', 'Bad request.');
                            db.close();
                        } else if (result.rank <= 2) {
                            //OK
                            collection.findOne({
                                username: c2.toLowerCase()
                                }, function(err, result) {
                                if (result == null) {
                                    socket.emit('reply', 'User ' + c2 + ' doesn\'t exist.');
                                } else {
                                    collection.update({
                                        username: c2.toLowerCase()
                                        }, {
                                        $set: {
                                            rank: 6
                                        }
                                    }, function(err, result) {
                                        socket.emit('reply', 'User ' + c2 + ' was banned by ' + by + '.');
                                        socket.broadcast.emit('reply', 'User ' + c2 + ' was banned by ' + by + '.');
                                        });
                                }
                            });
                        } else {
                            socket.emit('reply', 'Access denied.');
                        }
                    });
                });
            } else {
                socket.emit('reply', 'Invalid arguments.');
            }
            break;
            socket.emit('reply', 'User ' + c2 + ' was banned.');
            break;
            case '/unban':
	            if (typeof c2 != "undefined") {
	                MongoClient.connect('mongodb://127.0.0.1:27017/nodechat', function(err, db) {
	                    if (err)
	                        throw err;
	                    var collection = db.collection('nodechat');
	                    /*
	                     *  c2 = username
	                     */
	                    //Allowed to unban ?
	                    collection.findOne({
	                        username: by.toLowerCase()
	                        }, function(err, result) {
	                        if (result == null) {
	                            socket.emit('reply', 'Bad request.');
	                            db.close();
	                        } else if (result.rank <= 2) {
	                            //OK
	                            collection.findOne({
	                                username: c2.toLowerCase()
	                                }, function(err, result) {
	                                if (result == null) {
	                                    socket.emit('reply', 'User ' + c2 + ' doesn\'t exist.');
	                                } else {
	                                    collection.update({
	                                        username: c2.toLowerCase()
	                                        }, {
	                                        $set: {
	                                            rank: 4
	                                        }
	                                    }, function(err, result) {
	                                        socket.emit('reply', 'User ' + c2 + ' was unbanned by ' + by + '.');
	                                        socket.broadcast.emit('reply', 'User ' + c2 + ' was unbanned by ' + by + '.');
	                                        });
	                                }
	                            });
	                        } else {
	                            socket.emit('reply', 'Access denied.');
	                        }
	                    });
	                });
	            } else {
	                socket.emit('reply', 'Invalid arguments.');
	            }
        break;
        case '/mute':
            if (typeof c2 != "undefined"
            /* && typeof c3 != "undefined" && !isNaN(c3)*/
            ) {
                MongoClient.connect('mongodb://127.0.0.1:27017/nodechat', function(err, db) {
                    if (err)
                        throw err;
                    var collection = db.collection('nodechat');
                    /*
                     *  c2 = username
                     *  c3 = minutes    
                     */
                    //Checking if the rank of the user allows him to mute.
                    collection.findOne({
                        username: by.toLowerCase()
                        }, function(err, result) {
                        if (result == null) {
                            socket.emit('reply', 'Bad request.');
                            db.close();
                        } else if (result.rank <= 2) {
                            //Rank is OK, now we can mute
                            collection.findOne({
                                username: c2.toLowerCase()
                                }, function(err, result) {
                                if (result == null) {
                                    socket.emit('reply', 'User ' + c2 + ' doesn\'t exist.');
                                } else {
                                    collection.update({
                                        username: c2.toLowerCase()
                                        }, {
                                        $set: {
                                            rank: 5
                                        }
                                    }, function(err, result) {
                                        //count = c3 * 6000;
                                        socket.emit('reply', 'User ' + c2 + ' was muted by ' + by + '.');
                                        socket.broadcast.emit('reply', 'User ' + c2 + ' was muted by ' + by + '.');
                                        /*function unmute(){
	                    			collection.update({username: c2.toLowerCase()}, {$set: {rank: 4}}, function(err, result){
	                    				//Unmute ok
	                    			});
	                    		}
	                    		setInterval('unmute()',count);*/
                                        });
                                }
                            });
                        } else {
                            socket.emit('reply', 'Access denied.');
                        }
                    });
                });
            } else {
                socket.emit('reply', 'Invalid arguments.');
            }
            break;
        case '/unmute':
            if (typeof c2 != "undefined") {
                MongoClient.connect('mongodb://127.0.0.1:27017/nodechat', function(err, db) {
                    if (err)
                        throw err;
                    var collection = db.collection('nodechat');
                    //Based on the command '/mute'
                    collection.findOne({
                        username: by.toLowerCase()
                        }, function(err, result) {
                        if (result == null) {
                            socket.emit('reply', 'Bad request.');
                            db.close();
                        } else if (result.rank <= 2) {
                            //Rank is OK, now we can mute
                            collection.findOne({
                                username: c2.toLowerCase()
                                }, function(err, result) {
                                if (result == null) {
                        			//There's no user to mute
                                    socket.emit('reply', 'User ' + c2 + 'doesn\'t exist.');
                                } else {
                                    collection.update({
                                        username: c2.toLowerCase()
                                        }, {
                                        $set: {
                                            rank: 4
                                        }
                                    }, function(err, result) {
                                        socket.emit('reply', 'User ' + c2 + ' was unmuted by ' + by + '.');
                                        socket.broadcast.emit('reply', 'User ' + c2 + ' was unmuted by ' + by + '.');
                                    });
                                }
                            });
                        } else {
                            socket.emit('reply', 'Access denied.');
                        }
                    });
                });
            } else {
                socket.emit('reply', 'Invalid arguments.');
            }
            break;
        case '/register':
            if (typeof c2 != "undefined" && typeof c3 != "undefined") {
                MongoClient.connect('mongodb://127.0.0.1:27017/nodechat', function(err, db) {
                    if (err)
                        throw err;
                    var collection = db.collection('nodechat');
                    /*
                     * Rank: 6 - Banned      | 5 - Muted
                     *       4 - Normal user | 3 - Voiced
                     *       2 - Moderator   | 1 - Admin
                     */
                    collection.findOne({
                        username: c2.toLowerCase()
                        }, function(err, result) {
                        if (c2.length >= 13) {
                            socket.emit('reply', 'Name too long.');
                        } else if (result == null) {
                            collection.insert({
                                username: c2.toLowerCase(),
                                password: c3,
                                rank: 4
                            }, function(err, result) {
                                socket.emit('reply', 'Successfully registered.');
                            });
                            db.close();
                        } else {
                            socket.emit('reply', 'Name taken.');
                        }
                    });
                });
            } else {
                socket.emit('reply', 'Invalid arguments.');
            }
            break;
        case '/login':
            if (typeof c2 != "undefined" && typeof c3 != "undefined") {
                //Login code...
                MongoClient.connect('mongodb://127.0.0.1:27017/nodechat', function(err, db) {
                    if (err)
                        throw err;
                    var collection = db.collection('nodechat');
                    /*
                     * c2 = username
                     * c3 = password
                     */
                    collection.findOne({
                        username: c2.toLowerCase()
                        }, function(err, result) {
                        if (result == null) {
                            socket.emit('reply', 'User ' + c2 + ' doesn\'t exist.');
                            socket.emit('isLogged', '-1');
                        } else if (c3 == result.password) {
                            //Pass is OK, now we'll check if the user is banned
                            if (result.rank <= 5) {
                                users.push(c2);
                                socket.emit('addUsername', c2);
                                socket.broadcast.emit('addUsername', c2);
                                socket.emit('userlist', users);
                                socket.broadcast.emit('userlist', users);
                                socket.emit('isLogged', '1');
                            } else if (result.rank == 6) {
                                socket.emit('reply', 'You are banned and you cannot come again. Please get in touch with an admin to be unbanned.');
                                socket.emit('isLogged', '2');
                            } /*else if (the user is already connected) {
                               *We can block the access to him (one connection per
                               *account at the same time)
                            }  */ else {
                                socket.emit('reply', 'Something went wrong.');
                                socket.emit('isLogged', '0');
                            }
                        } else {
                            socket.emit('reply', 'Wrong id/password combinaison.');
                            socket.emit('isLogged', '0');
                        }
                        db.close();
                    });
                })
                } else {
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
