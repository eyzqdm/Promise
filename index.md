promise的参数的是executor函数: 执行器 (resolve, reject) => {} 
内部**立即同步调用**,异步操作在执行器中执行


以下几个方法为promise原型方法而非实例方法
- Promise.resolve
用于返回一个成功/失败的promise对象
如果传入的参数为 非Promise类型的对象, 则返回的结果为成功promise对象
如果传入的参数为 Promise 对象, 则改promise的结果决定了 resolve 的结果

- Promise.reject
返回一个失败的promise对象
无论传入是不是promise对象，都返回失败的promise对象