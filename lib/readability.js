var saxParser = require("readabilitySAX");
var _ = require('underscore');
var async = require("async");
var request = require('request');
var util = require('util');

/**
 * Configuring Redis Server
 */

if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require("redis").createClient();
}

/**
 * Readability Class
 *
 * @constructor
 */

var Readability = function(options){
  this.options = options || {};
}

/**
* Parse the URL content using SAX parser
*
* @param {String} links
* @param callback
* @return {Object}
*/

Readability.parse = function(links, callback){
  var resultLinks = [];

  async.map(links, function(link, finish){

    // Parsed before
    redis.get(link.url, function(err, reply){
      if(reply){

        var cacheLink = JSON.parse(reply);
        resultLinks.push(cacheLink);
        finish();
      
      } else {
        // Let the Readability get the readable content
        saxParser.get(link.url,'html', function(result){

          if(result.error) {
            console.log("ERROR" + result.text);
            return;
          }

          link.text = result.text;
          link.html = result.html;
          link.title = result.title;
          link.updated_at = new Date().toString();
          link.score = result.score;

          // Cache the result
          redis.set(link.url, JSON.stringify(link));

          // Push to result
          resultLinks.push(link);

          // Trigger finish
          finish();
        });
      }
    });

  },function(err, results){
    // State after finish parsing of URL chunks
    callback(resultLinks);
  });

};

// Exporting module
module.exports = Readability;

