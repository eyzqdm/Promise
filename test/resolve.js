/* const p1 = Promise.resolve(2);
const p2 = Promise.resolve(
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(3);
    }, 500);
  })
);
const p3 = Promise.resolve(Promise.resolve(5));

Promise.race([p1, p2, p3]).then((res) => {
  console.log(res);
});
 */
const Promise = require('./promiseA+')


Promise.resolve().then(() => {
  console.log('ok1')
  return new Promise(()=>{})  // 返回“pending”状态的Promise对象
}).then(() => {
  // 后续的函数不会被调用
  console.log('ok2')
}).catch(err => {
  console.log('err->', err)
})
