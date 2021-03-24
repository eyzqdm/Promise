// let Promise = require("./promise");
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

/* new Promise((resolve, reject) => {
  console.log("1");
  resolve(Promise.resolve("4"));
}).then((res) => {
  console.log(res);
});

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

let p = new Promise((resolve) => {
  throw '123'
})

console.log(p)