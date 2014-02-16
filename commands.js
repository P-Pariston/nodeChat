/*
 * commands.js
 * You can add or remove any command here.
 */

var commands = exports.commands = {
  version: function(){
    console.log('nodeChat version: '+ VERSION);
    return VERSION;
  },
  ban: function(target){
    console.log('User '+target+ ' was banned.');
    return 'User '+target+ ' was banned.';
  },
  kick: function(target){
    console.log('User '+target+ ' was kicked.');
    return 'User '+target+ ' was kicked.';
  }
};
