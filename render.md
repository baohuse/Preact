# react.render


## what is element 

element: 一个纯javascript对象，react用它来描述整个dom树的结构，对于组件来说，render方法返回的也是一个element, 其实我们写的jsx不过就是react.createElement函数的语法糖，经过babel编译之后，这个函数返回的是element,他的结构为


```
    {
        type: 'div',
        props: {
            className,
            children,
        }
    }  
```

其中，
type对应的可能是div, p, span等DomComponent, 也可以是 Header等自定义组件 classComponent, 
children可以是单个element,也可以是一个element数组

> 点击babel在线试一下把 https://babeljs.io/repl



## how do you convert element to component

> 分析一下elment的结构

**当element是string或者number**
'初学者的心态' | 10
**当element是一个obj**
{
    type: String | class
}

> 面向这句话编程
### when element is string
``` 
    const element = '当element是字符串，安排上'
    Preact.render(element, document.getElementById('root'))
```
### when element is obj
#### when element type of 'string', example { type: 'div' or 'p'}
```
    const element = Preact.createElement('div', {name: '大魔王', team: 'skt'}, 'hide on bransh') = 
    {
        type: 'div',
        props: {
            name: '大魔王',
            team: 'skt',
            children: 'hide on bransh'
        }
    }
    Preact.render(element, document.getElementById('root'))
```
#### when element type of class or function, example { type: APP}
```
    class App extend Preact.Component{
        render() {
            return element
        }
    }
    const element = Preact.createElement(APP, {name: 'faker'}, null)
    Preact.render(element, document.getElementById('root'))
```
### 在上面我们分析了下element的类型，我们现在就是要针对每种类型，做不同方式的渲染，最终无外乎递归children到创建dom元素，然后插入跟节点

```
    const Preact = {
        render: mount,
        createElement: createElement,
    }

```
根据上面的铺垫，我们的render函数简单来说就是把 element转为dom对象 再挂载到root根节点下面

####element -> dom
react实现的很巧妙， 他根据elment的每一种类型实现了不同类class, 

> element is string or number -> class ReactDOMTextComponent
> element.type is string -> class ReactDOMComponent
> element.type is func -> class ReactCompositeComponent

并且，在不同的类class中实现了， 分别实现了同样的方法(mountComponent),
所以，我们根据不同的element类型， new 出不同的实例(instance)， 进而执行instance的mountComponent方法既可以拿到node了

#### mountComponent

1. textComponent怎样实现mountComponent的 
2. domComponent怎样实现mountComponent的
3. compositeComponent(复合组件class or fun)怎样实现mountComponent的

#### 上面的实现方式正是oop中的多态

> 同一操作作用在不同对象上，会产生不同的效果

他的思想就是把 ‘做什么’， ‘谁去做’ 分开
比如：我是军统戴笠，我要刺杀汪精卫, 我们把这次行动叫removeW

```
    //刺客天木兄，叫one
    const one = {
        kill(){//刺杀能力}
    }
    //正常刺杀汪精卫
    function removeW() {
        one.kill()
    }

    //但是这样我戴老板不放心啊，万一失败了呢？ 老头子不得骂死我，所以我得在准备一个备用方案
    const two = {
        kill()
    }
    //多态刺杀
    function removeW() {
        if(oneSuccess) {
            one.kill()
        }else {
            two.kill()
        }
    }
    
```
```
 mount这一操作作用在不同element对应的class上，会产生不同的效果
    function mount(element, node) {
        //不同element对应不同的实例对象，却实现了mountComponent
        const componentInstance = instantiateReactComponent(element)
        //实例的mountComponent，element -> node
        const renderedNode = componentInstance.mountComponent()

        DOM.empty(node)
        DOM.appendChildren(node, renderedNode)
    }

    function instantiateReactComponent(element) {
        if(typeof element === 'string' || typeof element === 'number'){
            return new ReactDomTextComponent(element)
        }
        if(typeof element === 'obj' && typeof element.type === 'string'){
            return new ReactDomComponent(element)
        }
        if(typeof element === 'obj' && typeof element.type === 'function'){
            return new ReactCompositeComponent(element)
        }
    }
```

##实现ReactDomTextComponent

> 这个很简单，稍微思考一下就是把string用span包裹一下返回就可以
```
    class ReactDomTextComponent() {
        constructor(element){
            //保存一下，其他方法里面可以使用
            this._currentElement = element + '';
            this._rootNode = null
        }
        mountComponent() {
            return `<span>${this._currentElement}</span>`
        }
    }
```
##实现ReactDomComponent

> 这种情况下我们知道element.type 就是我们domComponent,例如 'div', 'h1', 'p', 
> props中除了children之外，其他的都是dom元素的属性(Attribute),当然className对于class, style是个对象这些我们暂时不做考虑，那我们在mountComponent的时候要做的很简单，
1. 创建对应type的元素 document.createElement(type)
2. 为元素添加属性， 注意props是一个对象，遍历Object.key(props) 使用node.setAttribute(key,value)
3. 遍历children
    3.1 如果children === 'string' | 'number' 使用document.createTextNode(props.children) 然后appenChildren()到刚新建的元素下面就可以
    3.2 不然呢，就是element了
    children有可能是一个element数组，也有可能是单个element, 我们统一为数组做处理
    思路还是一样的，
    遍历children, 既然children中的每一项还是element，那我们继续生成对应的instance，继续使用instance的mountComponent方法生成对应的node, 并appendChildren不就ok了（这里使用了递归）
具体实现如下
```
        //解析对象为真实的dom节点
    class ReactDOMComponent {
        constructor(element) {
            this._currentElement = element
            this._rootNodeId = null
            this._domNode = null
        }

        mountComponent() {
            //生成div元素
            const node = document.createElement(this._currentElement.type)
            //给元素加属性即element传进来的哪些东西
            this._domNode = node;
            const props = this._currentElement.props;
            //这块先不要管 style, className , 就管一般props跟children
            //设置属性
            Object.keys(props).forEach(propsName => {
                if(propsName === 'children') return
                //设置事件,匹配on开头的
                node.setAttribute(propsName, props[propsName])
            })
            //遍历children，初始化dom子节点
            this._createInitialDomChildren(props)

            return node
        }
        _createInitialDomChildren(props) {
            //创建文本节点
            if(
                typeof props.children === 'string' ||
                typeof props.children === 'number'
            ) {
                const textNode = document.createTextNode(props.children)
                this._domNode.appendChild(textNode)
            } else if(props.children) {

                const children = Array.isArray(props.children) ? props.children : [props.children]
                children.forEach((child, i) => {
                    //element -> component
                    //这里就是递归，调用自身，一层一层吧 element转化为我们的dom节点
                    const childComponent = instantiateReactComponent(child)
                    //调用自身的mountComponent生成dom节点并挂载
                    const childNode = childComponent.mountComponent()
                    this._domNode.appendChild(childNode)
                })
            }
        }
    }
```

