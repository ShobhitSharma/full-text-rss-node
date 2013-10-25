var request = require('request');
var cheerio = require('cheerio');

/**
 * Parser Base Class
 *
 * @constructor
 */

var Parser = function(options){
  this.options = options || {};
  this.url = options.url || "https://news.ycombinator.com/";
}

/**
* Get requested URL to parse.
*
* @param callback
* @return {Object}
*/

Parser.prototype.getUrl = function(callback){
  var self = this;
  // Makes a request to get the body of URL
  request(self.url, function (error, response, body) {
    var $, links, link;

    if (!error && response.statusCode == 200) {
      // Get the body
      $ = cheerio.load(body);

      // Query the links
      links = $('td.title a').filter(function(i, el) {
        return el.attribs.href != 'news2';
      }).map(function(i, el){
          return { 
            title: el.children[0] ? el.children[0].data : "",
            url: el.attribs.href
          };
        });

      // Trigger callback
      callback(links);
    }
  })
}

// Exporting Module
module.exports = Parser;
