"use strict";

const ws = require('ws');
const logger = require('winston');
const watch = require('glob-watcher');
const _ = require('lodash');

class tumbleweed {
  constructor(opts) {
    logger.info('\n  # #\n######\n###### tumbleweed on port ' + opts.port + '\n # #');

    var self = this;
    this.opts = opts;

    this.wss = new ws.Server(opts);

    this.wss.on('connection', function connection(ws) {
      var clientID = ws._socket._handle.fd;

      ws.on('message', function incoming(msg) {
        logger.info('spore %s: %s', clientID, msg);

        try {
          msg = JSON.parse(msg);
        } catch(e) {
          logger.warn('invalid json from spore');
          return;
        }

        if(msg.location || msg.command){
          //rebroadcast to other clients
          logger.info('broadcast', msg);
          self.broadcast(msg, clientID);
        }
      });

      ws.on('close', function(){});
    });

    // this.watcher = watch(opts.watch);
    this.watcher = watch(opts.watch);
    this.watcher.on('change', function(){
      self.broadcast(JSON.stringify({update:true}));
    });

    this.quit = this.wss.close;
  }

  broadcast(msg, sender) {
    var clients = this.wss.clients;
    if(sender) {
      clients = _.filter(clients, function(client){return client._socket._handle.fd !== sender});
    }

    clients.forEach(function(client) {
      client.send(JSON.stringify(msg));
    });
  }
}


module.exports = function(opts){
  return new tumbleweed(opts);
}