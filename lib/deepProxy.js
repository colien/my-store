
var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);

var methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
];
// 扩展 Array.prototype 的一些原型方法，这个主要是对 被观察的对象属性扩展的方法
methodsToPatch.forEach(function (method) {
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator() {
    var args = [], len = arguments.length;
    while (len--) args[len] = arguments[len];
    var result = original.apply(this, args); // 获取原始方法的执行结果
    var inserted; // 获取 给数组添加的 值
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break
      case 'splice':
        inserted = args.slice(2);
        break
    }
    if(inserted){
      parseProxy(inserted);
    }
    changeCallBack();
    return result
  });
});
// 获取当前对象中的 属性名
var arrayKeys = Object.getOwnPropertyNames(arrayMethods);


// 定义响应属性
function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

var changeCallBack;
var setChangeFns = function(store){
  return function(){
    if(store.status !== "mutation"){
      console.log(`不允手动修改 store 的数据，请使用 commit 提交修改`);
    }
    store.events.publish('stateChange', store.state);
    store.status = 'resting';
  }
};

var deepProxy = function(store, options){
  changeCallBack = setChangeFns(store);
  var state = parseProxy(options.state || {});
  return new Proxy(state, {
    set : function (state, key, value){
      console.log("proxy")
      state[key] = value;
      changeCallBack();
      return true;
    },
    get : function(state, key){
      var value = state[key];
      return value;
    }
  })
}
// 绑定传递过来的值的代理
function parseProxy(value){
  var valType = Object.prototype.toString.call(value).toLowerCase();
  if (valType === '[object array]') { // 处理数组的情况
    if(!value.__ob__){
      value.__ob__ = true;
      for (var i = 0, l = arrayKeys.length; i < l; i++) {
        var key = arrayKeys[i];
        def(value, key, arrayMethods[key]);
      }
      for(var n = 0; n < value.length; n++){
        parseProxy(value[n]);
      }
    }
  }else if(valType === "[object object]"){
    if(!value.__ob__){
      value.__ob__ = true;
      var keys = Object.getOwnPropertyNames(value);
      for (var i = 0, l = keys.length; i < l; i++) {
        if(keys[i] !== "__ob__"){
          var childValue = value[keys[i]];
          defineReactive(value, keys[i]);
          parseProxy(childValue);
        }
      }
    }
  }
  return value;
}

// 为对象添加观察者并扩展 对象属性的 getter 和 setter  它主要给 初始化 props render inject $attrs $listeners 使用
function defineReactive(obj, key, val) {
  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return
  }
  var getter = property && property.get;
  var setter = property && property.set;
  if ((!getter || setter) && arguments.length === 2) { // 规范化参数，保证 obj key val 都有值
    val = obj[key];
  }

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      var value = getter ? getter.call(obj) : val; // 获取原始结果
      return value
    },
    set: function reactiveSetter(newVal) {
      var value = getter ? getter.call(obj) : val; // 获取原始的结果
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      if (getter && !setter) { return } // 没有原始的 setter 方法
      if (setter) {
        setter.call(obj, newVal); // 调用原始的 setter 方法
      } else {
        val = newVal;
      }
      changeCallBack();
    }
  });
}

exports.deepProxy = deepProxy;