function MyPromise(executor) {
  this.PromiseState = "pending";
  this.PromiseResult = null;
  // 暂存then中的回调函数
  this.callback = {};
  //resolve 函数
  /* function resolve(data){

    } */
  const resolve = (data) => {
    // 状态只能修改一次，一旦修改就不能再次修改了
    if (this.PromiseState !== "pending") return;

    // 修改Promise对象状态
    this.PromiseState = "fulfilled";
    // 设置对象结果
    this.PromiseResult = data;
    if (this.callback.onResolved) {
      this.callback.onResolved(data);
    }
  };

  //reject 函数
  /* function reject(data){

    } */
  const reject = (data) => {
    if (this.PromiseState !== "pending") return;
    this.PromiseState = "rejected";
    this.PromiseResult = data;
    if (this.callback.onRejected) {
      this.callback.onRejected(data);
    }
  };

  try {
    // 执行器 直接同步调用
    executor(resolve, reject);
  } catch (e) {
    // 执行器抛出错误时，直接reject
    reject(e);
  }
}
MyPromise.prototype.then = function (onResolved, onRejected) {
  // then方法一旦指定，则在执行器执行完后会立即执行
  // then方法中 当Promise已经改变 则直接执行回调 否则暂存回调
  if (this.PromiseState === "fulfilled") {
    onResolved(this.PromiseResult);
  }
  if (this.PromiseState === "rejected") {
    onRejected(this.PromiseResult);
  } else {
    this.callback = {
      onResolved: onResolved,
      onRejected: onRejected,
    };
  }
};

const p = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    reject(4);
  }, 3000);
  // throw new Error('err')
});

p.then(
  (res) => {
    console.log(res);
  },
  (err) => {
    console.log(err);
  }
);

console.log(p);
