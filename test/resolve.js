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

const res = Promise.resolve(1).then(2);
setTimeout(() => {
  console.log(res);
});
