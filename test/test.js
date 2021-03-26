let Promise = require("../promise");
/* setTimeout(() => {
  console.log(1)
}, 0);
new Promise((resolve) => {
  console.log(2) // 同步
  resolve()
}).then(() => {
  console.log(3)
}).then(() => {
  console.log(4)
})
console.log(5) */
// 使用自己实现的promise 顺序是25134 因为then回调异步执行使用的是宏任务 定时器
// es6的promise使用的是微任务 顺序是25341

new Promise((resolve, reject) => {
  console.log("1");
  resolve(Promise.resolve("4"));
}).then((res) => {
  console.log(res);
});

/*  Promise.resolve("4")同步执行 返回成功的promise 要执行该promise的then 因此进入队列
 执行大then 进入队列 此时由于自己的resolve还没执行完 因此PromiseState是undeifined
 对头第一个then执行成功回调 resolve 4 进入resolvePromise 由于传入的成功回调没有返回值 因此resolve undefined
 resolve继续执行 将PromiseState改为4 执行大then的回调 打印4 
 继续进入resolvePromise 依然没返回值  resolve undefined */
 new Promise((resolve) => {
  resolve();
})
  .then(() => {
    console.log("2");
  })
  .then(() => {
    console.log("3");
  })
  .then(() => {
    console.log("5");
  });
 /*
 记住 then本身不是异步的 只有回调本身是异步的 其只有调用回调时才会被
 推入队列 then中把回调推入数组是同步的 数组中的回调在resolve中执行时才会被推入回调

  首先 resolve(promise(4))进入队列; 大then同步执行 把回调推入cb数组
  第二个then同步执行 里面的回调被推入队列.同理 3 5也被推入相应的cb
  第一轮 resolve(promise(4)) 2 
  执行 resolve(promise(4)) 打印4被推入队列 24
  打印2 3被推入 4 3
  打印4  3
  打印3  5
  打印5 
  1 2 4 3 5
 
  总之 then同步！！执行。
  当执行器内是同步操作 则 then中的回调立即进入队列
  是异步时 then中的回调先被同步推入cb数组 等到resolve执行完毕 才会进入队列！

  当resolve中传入的是promise 那就相当于resolve异步执行。因为要递归解析promise。
  那就必然会调用then。进而里面的回调会进入队列。导致执行外面大then执行时resolve还未执行完毕 
  promise状态还未改变。因此效果跟执行器传入异步操作一样。
  */

/* let p = new Promise((resolve) => {
  resolve(2);
});
let pt = p.then((res) => {
  return new Promise((resolve) => {
    resolve(Promise.resolve(5));
  })
});

setTimeout(() => {
  console.log(pt); // 5
});
 */

/* let p = new Promise((resolve) => {
  throw '123'
})

console.log(p) */