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
  // 执行 then 方法是同步的，而 then 中的回调是异步的

/*
为什么说内部是同步任务时 先改变状态再执行then 而异步任务时先执行then再改变状态
重点是then中的回调函数不一定是在then执行时调用的! 当状态是pending时会暂存回调函！ 
 */
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
