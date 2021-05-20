exports.pubsub = class pubsub {
  constructor(){
    this.events = {};
  }
  subscribe(event, callBack){
    var self = this;

    if(!self.events.hasOwnProperty(event)){
      self.events[event] = [];
    }
    return self.events[event].push(callBack);
  }
  publish(event, data){
    var self = this;
    if(!self.events.hasOwnProperty(event)){
      console.log("这个事件不存在");
      return [];
    }
    return self.events[event].map((item)=>{
      item(data);
    })
  }
}


