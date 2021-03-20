const Pending = "pending"; // 等待
const Fulfilled = "fulfilled"; // 成功
const Reject = "reject"; // 失败

// 判断是否是promise
let isPromise = (x) => {
  if ((typeof x === "object" && x != null) || typeof x === "function") {
    if (typeof x.then === "function") {
      return true;
    }
  }
  return false;
};

function resolvePromise(promise2, x, resolve, reject) {
  // 此方法 为了兼容所有的promise，n个库中 执行的流程是一样的
  // 尽可能详细 不出错
  // 1.不能引用同一个对象 可能造成死循环
  if (promise2 === x) {
    return reject(new TypeError("不能引用同一个对象"));
  }
  let called;
  // 2.判断x的类型 x如果是对象或者函数 说明他有可能是一个promise
  if ((typeof x === "object" && x != null) || typeof x === "function") {
    // 有可能是promise promise要有then方法
    // 但是调用then方法有可能的时候有可能异常
    try {
      let then = x.then; // 因为then方法 可能使用getter来定义的
      if (typeof then === "function") {
        // 到这只能认为它是promise了
        // call 改变this指向x   只取一次
        /* 
                  let obj = {
                      then(){
                      
                      }
                  }
                  let fn = obj.then
                  fn.call(obj)
              */
        then.call(
          x,
          (y) => {
            // 只取一次 当前promise解析出来的结果可能还是一个promise
            // 继续解析知道它是一个普通值为止
            // 利用解析resolve直到解析为普通值为止
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e); // 取值失败错误信息抛出去
    }
  } else {
    resolve(x);
  }
}

function Promise(executor) {
  this.PromiseState = Pending;
  this.PromiseResult = null;
  // 暂存then中的回调函数
  // 声明为数组 便于指定多个回调函数
  this.callbacks = [];

  //
  /*
resolve 函数  
1 修改peomise状态
2 将promise结果设置为传入的值
3 调用成功的回调函数(如果是异步操作)
   */
  const resolve = (data) => {
    // 增加判断如果resolve传入的是promise的判断
    if (data instanceof Promise) {
      // 递归解析直到为普通值为止
      // Promise.resolve(4)
      data.then(resolve, reject);
      return;
    }
    // 状态只能修改一次，一旦修改就不能再次修改了
    if (this.PromiseState !== Pending) return;

    // 修改Promise对象状态
    this.PromiseState = Fulfilled;
    // 设置对象结果
    this.PromiseResult = data;
    // 调用成功的回调函数 将成功的结果返回给回调函数

    if (this.callbacks.length > 0) {
      this.callbacks.forEach((cb) => cb.onResolved());
    }
  };

  //reject 函数
  const reject = (data) => {
    if (this.PromiseState !== Pending) return;
    this.PromiseState = Reject;
    this.PromiseResult = data;
    setTimeout(() => {
      if (this.callbacks.length) {
        this.callbacks.forEach((cb) => cb.onRejected());
      }
    });
  };

  try {
    // 执行器 直接同步调用
    executor(resolve, reject);
  } catch (e) {
    // 执行器抛出错误时，直接reject
    reject(e);
  }
}
Promise.prototype.then = function (onResolved, onRejected) {
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

  //没传回调函数 则指定默认回调行为 可以做到一直向下传递
  if (typeof onRejected !== "function") {
    onRejected = (reason) => {
      throw reason; // 回调函抛出异常 被catch捕获到 此时then的返回结果就是失败的promise 且结果为catch捕获的
      // 错误信息 reason 并会传递到下一个then。即下个then会调用失败的回调函，若下个then的回调函
      // 也没制定 则又会执行这个默认行为 因此会一直向下传递
      // 同理 成功回调的传递原理也一样
    };
  }
  if (typeof onResolved !== "function") {
    onResolved = (value) => value;
    //value => { return value};
  }
  let promise2 = new Promise((resolve, reject) => {
    // 封装重复操作
    const callback = function (type) {
      try {
        // 获取回调函数的执行结果  回调函数的参数就是promise的结果 也就是resolve/reject中传入的值
        let result = type(this.PromiseResult);
        // 判断返回结果的类型 若非promise 返回成功的promise
        // 若是promise 则返回与该promise状态相同的promise
        // 使用instanceof判断是否是promise的实例
        if (result instanceof Promise) {
          // 如果是 Promise 类型的对象, 那么一定可以调用then方法。
          // 因此可以在then的成功/失败回调中 改变then返回的promise的状态
          if (result === promise2)
            return reject(new TypeError("不能引用同一个对象"));
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
    }.bind(this);
    if (this.PromiseState === Fulfilled) {
      setTimeout(() => {
        try {
          let x = onResolved(this.PromiseResult);
          // resolvePromise方法是判断返回值是不是promise
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });
    } else if (this.PromiseState === Reject) {
      setTimeout(() => {
        try {
          let x = onRejected(this.PromiseResult);
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });
    } else {
      /*
       pending时说明是异步任务 之前的做法是在构造函数中调用resolve时取出暂存的
       回调函数并执行。现在就有一个问题。由于then的返回结果由then的回调函数决定。
       而then的回调函数在构造函数中执行，那如何拿到返回结果呢？绑定上下文
       */
      this.callbacks.push({
        // data是resolve是传入的参数 也即promise的结果
        onResolved: function () {
          setTimeout(() => {
            try {
              let x = onResolved(this.PromiseResult);
              // resolvePromise方法是判断返回值是不是promise
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        }.bind(this), // 绑定上下文
        onRejected: function () {
          setTimeout(() => {
            try {
              let x = onRejected(this.PromiseResult);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        }.bind(this),
      });
    }
  });
  return promise2;
};

// 添加 catch 方法
// 穿透的意义是 即使我在前面有异常，但没指定相应的失败毁掉，则会错误一直向下传递，直到被catch捕获
Promise.prototype.catch = function (onRejected) {
  // 直接调用then,不传成功的回调
  return this.then(undefined, onRejected);
};

// 添加finally方法
/*
 无论最后状态如何 finally的回调都会执行
 finally回调不接受任何参数
 finally实质上是then方法的特例
 finally不会阻止结果的传递
 */
Promise.prototype.finally = function (onFinished) {
  return this.then((val) => {
    onFinished();
    return val;
  }).catch((err) => {
    onFinished();
    return err;
  });
};

//添加 resolve 方法返回promise 状态和结果由传入的值决定
Promise.resolve = function (value) {
  //返回promise对象
  return new Promise((resolve, reject) => {
    if (value instanceof Promise) {
      value.then(
        (res) => {
          resolve(res);
        },
        (err) => {
          reject(err);
        }
      );
    } else {
      //状态设置为成功
      resolve(value);
    }
  });
};

//添加 reject 方法 始终返回失败的promise
Promise.reject = function (reason) {
  return new Promise((resolve, reject) => {
    reject(reason);
  });
};

//添加 all 方法
Promise.all = function (promises) {
  //返回结果为promise对象
  return new Promise((resolve, reject) => {
    //声明变量
    let count = 0;
    let arr = [];
    //遍历
    for (let i = 0; i < promises.length; i++) {
      if (isPromise(promises[i])) {
        promises[i].then(
          (res) => {
            //得知对象的状态是成功
            //每个promise对象 都成功
            count++;
            //将当前promise对象成功的结果 存入到数组中
            arr[i] = res;
            // 只有全部promise均成功 all才成功
            if (count === promises.length) {
              //修改状态
              resolve(arr);
            }
          },
          (err) => {
            reject(err);
          }
        );
      } else {
        // 非promise 直接推入结果数组
        count++;
        arr[i] = promises[i];
        if (count === promises.length) {
          resolve(arr);
        }
      }
    }
  });
};

//添加 race 方法
Promise.race = function (promises) {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i].then(
        (v) => {
          //谁率先改变状态 返回值就是谁的结果
          resolve(v);
        },
        (r) => {
          //修改返回对象的状态为 『失败』
          reject(r);
        }
      );
    }
  });
};
//添加any方法
/*
该方法接受一组 Promise 实例作为参数，包装成一个新的 Promise 实例返回。
只要参数实例有一个变成fulfilled状态，包装实例就会变成fulfilled状态；
如果所有参数实例都变成rejected状态，包装实例就会变成rejected状态。 
any方法可以看作all方法的反例
 */
Promise.any = function (promises) {
  return new Promise((resolve, reject) => {
    //声明变量
    let count = 0;
    //遍历
    for (let i = 0; i < promises.length; i++) {
      //
      promises[i].then(
        (res) => {
          resolve(res);
        },
        () => {
          count++;
          if (count === promises.length) {
            reject(new AggregateError([], "All promises were rejected"));
          }
        }
      );
    }
  });
};

//添加allSettled方法
/*
 受一组 Promise 实例作为参数，包装成一个新的 Promise 实例。
 只有等到所有这些参数实例都返回结果，不管是fulfilled还是rejected
 包装实例才会结束状态变为fulfilled，不会变成rejected
 返回值格式为
  [
    { status: 'fulfilled', value: 42 },
    { status: 'rejected', reason: -1 }
  ]
 */
Promise.allSettled = function (promises) {
  return new Promise((resolve) => {
    //声明变量
    let count = 0;
    let result = [];
    //遍历
    for (let i = 0; i < promises.length; i++) {
      //
      promises[i].then(
        (res) => {
          result[i] = {
            status: Fulfilled,
            value: res,
          };
          count++;
          // if(count === promises.length) resolve(result)
        },
        (err) => {
          count++;
          result[i] = {
            status: Reject,
            reason: err,
          };
          count++;
          //  if (count === promises.length) resolve(result)
        }
      );
    }
    resolve(result);
  });
};

/*
then的链式调用.下个then与本then的关系 就如同本then与本promise的关系一样
本then的状态由自身的回调函数的执行结果决定。而调用哪个回调函数则取决于本promise的状态。
同理 下个then执行哪个回调函数由本then的状态决定。
当本then的回调函返回的是普通变量。则本then返回成功的promise(resolve(reason))，结果就是那个普通变量。
此时下个then就会调用它自己的成功的回调,参数就是那个普通变量。
而当本then的回调函返回的是promise，则本then的状态由该回调函的返回的promise决定。

总之 then返回的是promise。记住这点就足够了
注意 上个then的状态不会影响下个then的状态 因为影响状态的是then的回调函的返回值
上个then的状态和结果影响的只是下个then执行哪个回调函以及相应的入参
 */

Promise.defer = Promise.deferred = function () {
  let dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};

module.exports = Promise;
