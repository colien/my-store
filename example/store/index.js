var { Store } = require("../../index");

var store = new Store({
  state : {bookList : []},
  actions : {
    addBook : function(context, payload){
      context.commit("addBook",payload);
    },
    update : function(context, payload){
      context.commit("update",payload);
    }
  },
  mutations : {
    addBook : function(state, payload){
      state.bookList.push(payload);
    },
    update : function(state, payload){
      state.bookList[0].bookid = payload;
    }
  }
})

exports.store = store;