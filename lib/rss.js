var RSS = require("rss");
var Readability = require("./readability").Readability;
var Parser = require("./parser").Parser;
var os = require("os");
var hostName = os.hostname();

/**
 * RSS Base Class
 *
 * @constructor
 */

var RSS = function(options){
  this.options = options || {};
}

/**
* Parse the URL content using SAX parser
*
* @param callback
* @return {Object}
*/

RSS.prototype.links = function(callback){

  var page_parser = new Parser();

  page_parser.getLinks(function(links){
    Readability.parse(links, function(resultLinks){
      callback(resultLinks);
    });
  });
}

/**
* Parse the URL content using SAX parser
*
* @param callback
* @return {Object}
*/

RSS.prototype.feeds = function(callback){
  var link,
    i,
    feed = new RSS({
      title: 'Test Title',
      description: 'Hacker news front page',
      feed_url: 'http://' + hostName,
      site_url: 'http://' + hostName,
      image_url: 'http://' + hostName + '/icon.png',
      author: 'hacker news'
    });

  this.links(function(resultLinks){

    for (i=0; i < resultLinks.length; i++) {
      link = resultLinks[i];

      feed.item({
        title:  link.title,
        description: link.html,
        url: link.url,
        author: link.author,
        date: link.updated_at
      });
    };

    callback(feed.xml());

  });

}

// Exporting Module
module.exports = RSS;
