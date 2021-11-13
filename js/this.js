//第一题
window.name = "bd"
class A {
    constructor() {
        this.name = "123"
    }
    getA() {
        console.log(this);
        return this.name + 1
    }
}
let a = new A();
let funcA = a.getA
funcA()

//第二题
const a = 1;
const obj = {
    a: 2,
    show1: function () {
        console.log(this.a);
    },
    show2: () => {
    
        console.log(this);
        console.log(this.a);
    }
}
obj.show1();
obj.show2();
const func1 = obj.show1;
const func2 = obj.show2;
func1();
func2();

//第三题
function Foo(){
    Foo.a=function(){
        console.log(1);;
    }
    this.a=function(){
        console.log(2);;
    }
}
Foo.prototype.a=function(){
    console.log(3);
}
Foo.a=function(){
    console.log(4);
}
Foo.a();
let obj=new Foo();
obj.a();
Foo.a();