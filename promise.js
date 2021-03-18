function MyPromise(executor) {
  this.PromiseState = "pending";
  this.PromiseResult = null;
  // 暂存then中的回调函数
  // 声明为数组 便于指定多个回调函数
  this.callbacks = [];

  //resolve 函数
  const resolve = (data) => {
    // 状态只能修改一次，一旦修改就不能再次修改了
    if (this.PromiseState !== "pending") return;

    // 修改Promise对象状态
    this.PromiseState = "fulfilled";
    // 设置对象结果
    this.PromiseResult = data;
    // 调用成功的回调函数 将成功的结果返回给回调函数
    if (this.callbacks.length) {
      this.callbacks.forEach((cb) => cb.onResolved(data));
    }
  };

  //reject 函数
  const reject = (data) => {
    if (this.PromiseState !== "pending") return;
    this.PromiseState = "rejected";
    this.PromiseResult = data;
    if (this.callbacks.length) {
      this.callbacks.forEach((cb) => cb.onRejected(data));
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

  /*
  then方法的返回结果是一个新的promise对象,其状态和返回结果由then的回调的返回结果决定
   */

  return new MyPromise((resolve, reject) => {
    if (this.PromiseState === "fulfilled") {
      try {
        // 获取成功的回调函数的执行结果
        let result = onResolved(this.PromiseResult);
        // 判断返回结果的类型 若非promise 返回成功的promise
        // 若是promise 则返回与该promise状态相同的promise
        // 使用instanceof判断是否是promise的实例
        if (result instanceof MyPromise) {
          // 如果是 Promise 类型的对象, 那么一定可以调用then方法。
          // 因此可以在then的成功/失败回调中 改变then返回的promise的状态
          result.then(
            (res) => {
              resolve(res);
            },
            (err) => {
              reject(err);
            }
          );
        } else {
          //结果的对象状态为『成功』
          resolve(result);
        }
      } catch (e) {
        // 抛出错误 则直接reject
        reject(e);
      }
    }
    if (this.PromiseState === "rejected") {
      try {
        // 获取失败的回调函数的执行结果
        let result = onRejected(this.PromiseResult);
        if (result instanceof MyPromise) {
          result.then(
            (res) => {
              resolve(res);
            },
            (err) => {
              reject(err);
            }
          );
        } else {
          resolve(result);
        }
      } catch (e) {
        reject(e);
      }
    } else {
      /*
       pending时说明是异步任务 之前的做法是在构造函数中调用resolve时取出暂存的
       回调函数并执行。现在就有一个问题。由于then的返回结果由then的回调函数决定。
       而then的回调函数在构造函数中执行，那如何拿到返回结果呢？绑定上下文
       */
      this.callbacks.push({
        // data是resolve是传入的参数 也即promise的结果
        onResolved: function (data) {
          try {
            //执行成功回调函数
            let result = onResolved(data);
            // 回调函数的返回值是promise 则其状态和结果决定then返回的promise的状态和结果
            if (result instanceof Promise) {
              result.then(
                (res) => {
                  resolve(res);
                },
                (err) => {
                  reject(err);
                }
              );
            } else {
              resolve(result);
            }
          } catch (e) {
            reject(e);
          }
        }.bind(this),// 绑定上下文
        onRejected: function (data) {
          try {
            let result = onRejected(data);
            if (result instanceof Promise) {
              result.then(
                (res) => {
                  resolve(res);
                },
                (err) => {
                  reject(err);
                }
              );
            } else {
              resolve(result);
            }
          } catch (e) {
            reject(e);
          }
        }.bind(this),
      });
    }
  });
};

const p = new MyPromise((resolve, reject) => {
  setTimeout(() => {

    reject(55)
  },3000)
  // throw new Error('err')
});

let then = p.then(
  (res) => {
    //throw new Error('123')
    return res;
  },
  (err) => {
    return new Promise((resolve,reject)=>{
      resolve(4)
    })
    // throw new Error('123')
  }
);

console.log(p);
console.log(then);
