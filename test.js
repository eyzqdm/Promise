let Promise = require("./promise");

new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(Promise.resolve(4));
  });
})
  .then((res) => {
    console.log(res)
  })

