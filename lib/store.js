var { pubsub } = require("./pubsub");
var { deepProxy } = require("./deepProxy");

exports.Store = class store{
  constructor(options){
    var self = this;
    this.state = {};
    this.actions = {};
    this.mutations = {};
    this.status = 'resting';  // 防止手动更新
    this.events = new pubsub();

    if(options.hasOwnProperty('actions')){
      this.actions = Object.assign(this.actions, options.actions);
    }
    if(options.hasOwnProperty("mutations")){
      this.mutations = Object.assign(this.mutations, options.mutations);
    }
    this.state = deepProxy(self, options);
  }

  dispatch(action, payload){
    var self = this;
    if(typeof self.actions[action] !== 'function'){
      console.log(`Store.actions 中没有 ${action} 方法`);
      return false;
    }
    self.status = 'action';
    self.actions[action](self, payload);
    return true;
  }
  commit(mutation, payload){
    var self = this;
    if(typeof self.mutations[mutation] !== 'function'){
      console.log(`Store.mutations 中没有 ${mutation} 方法`);
      return false;
    }
    self.status = 'mutation';
    self.mutations[mutation](self.state, payload);
    return true;
  }

}
