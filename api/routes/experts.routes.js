'use strict';

var Firebase = require('firebase'),
    needle   = require('needle'),
   _         = require('lodash'),
   request   = require('request'),
   config    = require('../../config/config');

var root = new Firebase(config.development.firebase.rootRefUrl);

module.exports = function(tags, cb) {
  root.child('users').on('value', function(snap) {
    var data      = snap.val(),
      skills      = {},
      expertMatch = {},
      expertArray = [];
      
    for (var i in data) {
      if (data.hasOwnProperty(i)) {
        var skillArray = (data[i].skills + "").toLowerCase().split(',');
        var tagsMatchSkill = _.intersection(skillArray, tags);
        if (tagsMatchSkill.length > 0) {
          expertMatch['user'] = data[i];
          expertArray.unshift(data[i]);
          send(expertArray, function(error, status, body) {
            if (error) {
              cb(error);
            } else if (status !== 200) {
              // inform user that our Incoming WebHook failed
               // new Error('Incoming WebHook: ' + status + ' ' + body);
              cb(new Error('Incoming WebHook: ' + status + ' ' + body));
            } else {
              cb(null, status);
            }
          });
        } 
      }
    }

  });
}

function send(expert, cb) {
  console.log('expert: ', expert);
  var uri = ' https://yodabot.herokuapp.com/experts';

  request({
    uri: uri,
    method: 'POST',
    json: expert
  }, function(error, response, body) {
    console.log('response: ', response.statusCode);
    console.log('body: ', body);
    if (error) {
      return cb(error);
    }

    cb(null, response.statusCode, body);
  });
}
