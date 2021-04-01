const Promise = require("../promise.js");
const p1 = Promise.resolve(2);
const p2 = Promise.resolve(3);
const p3 = Promise.race([4,p1,p2]);
setTimeout(() => {
  console.log(p3);
});
/* console.log(a)
function test() {
  console.log(a) // 4
  a = 3;
}
var a = 4;
test();
console.log(a); // 3 */
/*
本题 如果test接收变量a 由于是按值传递 因此不会影响全局的a
如果不接受参数 由于作用域链  会找到外界的a
 */
