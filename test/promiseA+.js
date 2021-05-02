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
  if (promise2 === x) {
    return reject(new TypeError("不能引用同一个对象"));
  }
  let called;
  if ((typeof x === "object" && x != null) || typeof x === "function") {
    try {
      let then = x.then; // 因为then方法 可能使用getter来定义的
      if (typeof then === "function") {
        then.call(
          x,
          (y) => {
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
  this.callbacks = [];

  const resolve = (data) => {
    if (data instanceof Promise) {
      data.then(resolve, reject);
      return;
    }
    if (this.PromiseState !== Pending) return;

    this.PromiseState = Fulfilled;
    this.PromiseResult = data;
    if (this.callbacks.length > 0) {
      this.callbacks.forEach((cb) => cb.onResolved());
    }
  };

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
    executor(resolve, reject);
  } catch (e) {
    reject(e);
  }
}
Promise.prototype.then = function (onResolved, onRejected) {
  if (typeof onRejected !== "function") {
    onRejected = (reason) => {
      throw reason;
    };
  }
  if (typeof onResolved !== "function") {
    onResolved = (value) => value;
  }
  let promise2 = new Promise((resolve, reject) => {
    /* const callback = function (type) {
      try {
        let result = type(this.PromiseResult);

        if (result instanceof Promise) {
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
          resolve(result);
        }
      } catch (e) {
        reject(e);
      }
    }.bind(this); */
    if (this.PromiseState === Fulfilled) {
      setTimeout(() => {
        try {
          console.log(onResolved)
          let x = onResolved(this.PromiseResult);

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
      this.callbacks.push({
        onResolved: function () {
          setTimeout(() => {
            try {
              let x = onResolved(this.PromiseResult);

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

Promise.prototype.catch = function (onRejected) {
  return this.then(undefined, onRejected);
};

Promise.prototype.finally = function (onFinished) {
  return this.then((val) => {
    onFinished();
    return val;
  }).catch((err) => {
    onFinished();
    return err;
  });
};

Promise.resolve = function (value) {
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

Promise.reject = function (reason) {
  return new Promise((resolve, reject) => {
    reject(reason);
  });
};

Promise.all = function (promises) {
  return new Promise((resolve, reject) => {
    let count = 0;
    let arr = [];

    for (let i = 0; i < promises.length; i++) {
      if (isPromise(promises[i])) {
        promises[i].then(
          (res) => {
            count++;

            arr[i] = res;

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

Promise.defer = Promise.deferred = function () {
  let dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};
module.exports = Promise;
