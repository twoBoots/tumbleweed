
function spore(opts) {
  this.ws = null;
  this.init(opts);
}

spore.prototype.init = function(opts) {
  var self = this;
  this.ws = new WebSocket('ws://' + location.hostname + ':' + opts.port);

  this.ws.onopen = function(){ self.send({userAgent:navigator.userAgent});};
  this.ws.onmessage = function(msg){

    try {
      msg = JSON.parse(msg.data);
    } catch(e) {
      return;
    }

    if(msg.location){
      top.location = msg.location;
      return;
    }

    if(msg.command){
      eval(atob(msg.command));
      return;
    }

    location.reload();
  };

  this.ws.onclose = function(){self.init()};
}

spore.prototype.fc = function(){
  console.log('force close');
  this.ws.close();
}

spore.prototype.send = function(data){
  var self = this;

  if(self.ws.readyState !== 1) {
    return;
  }

  self.ws.send(JSON.stringify(data));
}

spore.prototype.command = function(command){
  var self = this;

  self.send({"command": btoa(command)});
}

var s = new spore({port:8003});

document.onkeydown = function(e){
  if(e.keyCode === 39) {
    s.send({location: location.href, seed: (s.seed || {})});
  }
};