/* 
let p = new Promise((resolve, reject) => {
  reject(4);
});

let then = p.then(
  () => {},
  (err) => {
    return new Promise((resolve, reject) => {
      reject(5)
    });
  }
);

console.log(p);
console.log(then);
 */
const obj = {
  name:'xiaom'
}

const foo = function(){
console.log(this.name)  
}.bind(obj)

foo()