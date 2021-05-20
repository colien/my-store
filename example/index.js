var { store } = require('./store/index.js');

var Koa = require("koa");
var app = new Koa();

app.use(async function(ctx, next){
  store.events.subscribe('stateChange', (params) => {
    console.log(params.bookList);
    console.log(params.bookList[0].bookid);
    ctx.body = "成功了";
  });
  store.dispatch('addBook',{bookid: 203});
  store.dispatch('update',10);
  store.dispatch('addBook', {bookid: 203, msg : {
    ather : "colien",
    content: ["哈哈"],
    time : new Date().getTime(),
  }});
})

app.listen(8010, function(){
  console.log('server started: localhost:8010');
})


