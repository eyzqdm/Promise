
promise 的参数的是 executor 函数: 执行器 (resolve, reject) => {}
内部**立即同步调用**,异步操作在执行器中执行

以下几个方法为 promise 原型方法而非实例方法

- Promise.resolve
  用于返回一个成功/失败的 promise 对象
  如果传入的参数为 非 Promise 类型的对象, 则返回的结果为成功 promise 对象
  如果传入的参数为 Promise 对象, 则改 promise 的结果决定了 resolve 的结果

- Promise.reject
  返回一个失败的 promise 对象
  无论传入是不是 promise 对象，都返回失败的 promise 对象

- 几个关键问题
  1 三种方式修改状态
  resolve() pending->resolved
  reject() pending=>rejected
  throw 关键字 抛出异常 pending=>rejected
  2 then 返回的 promise 的状态 由 then 指定的回调的返回结果决定
  普通对象 成功的 promise 对象 返回成功的 promise
  抛出异常 失败的 promise 返回失败的 promise

  3 then 链式调用
  4 异常穿透
  当使用 promise 的 then 链式调用时, 可以在最后指定失败的回调（.catch()）,前面任何操作出了异常, 都会传到最后失败的回调中处理。
  5 中断 promise 链
  在回调函数中返回一个pendding状态的promise对象