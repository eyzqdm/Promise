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

// const { resolve } = require("../promise");

const Promise = require("../promise");
Promise.resolve(2)
  .then(() => {
    return 4
  })
  .finally(() => {
    console.log("asd");
  })
  .then(
    (res) => {
      console.log(res + 1);
    },
    (err) => {
      console.log(err + 'asd');
    }
  );
