const p = new Promise((resolve) => {
  resolve(1);
});

/* const t = p.then(() => {
  // return Promise.resolve(1)
  //throw new Error('123')
  //return 1
  return Promise.reject(1);
});
console.log(t); */

const t = p
  .then((res) => {
    console.log(res);
    return res + 1;
  })
  .then((res) => {
    console.log(res);
    return new Promise((resolve) => {
      // 返回状态为pending的promise 可以中断链式调用
    });
  })
  .then((res) => {
    console.log(res);
  });
console.log(t); // 1,2,3
