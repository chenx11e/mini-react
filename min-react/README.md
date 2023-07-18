引入：

react创建渲染元素：

```jsx
const element = <h1 title="foo">Hello</h1> //定义一个React element
const container = document.getElementById('root') //从DOM中拿到一个节点
ReactDOM.render(element, container) //将元素渲染到容器中
```

1. 创建元素——createElement

   1. ```js
       const element1 = React.createElement(
          'h1',
          { title: 'foo' },
          "hello"
        )
       
       //解析成：
       //一个JSX元素就是带有type和props属性的对象。type指定了DOM节点的类型，即标签名  props是个对象，从JSX属性中接收所有的key、value，并且有一个特别的属性children
       const element = {
          type: 'h1',
          props: {
            title: 'foo',
            children: 'Hello吖'
          }
        }
      ```

2. render渲染

   1. ```jsx
      const node = document.createElement(element.type) //根据传入的type创建一个新的节点node
        node["title"] = element.props.title //把props中的属性传给node
        // 然后创建node的子节点children——是文本节点
        const text = document.createTextNode("")
        text['nodeValue'] = element.props.children
        // 把textNode添加到h1里面，把h1添加到container里。
        node.appendChild(text)
        container.appendChild(node)
      ```

## createElement

实现效果：*createElement就是创建一个带有type和props的对象*

```jsx
 createElement("div") ==> 
  {
    type: "div",
      props: {
      "children": []
    }
  }
  createElement("div",null,a) ==> 
  {
    type: "div",
      props: {
      "children": [a]
    }
  }
  createElement("div",null,a,b) ==> 
  {
    type: "div",
      props: {
      "children": [a,b]
    }
  }
```

代码实现：

1. props分为普通的key、value还有children 
2. 非children就添加到元素身上作为属性就可以了 
3. children需要分为文本节点——直接展示  对象——遍历插入DOM树中

```jsx
 // children数组中也可能有像 strings、numbers 这样的基本值。因此我们对所有不是对象的值创建一个特殊类型 TEXT_ELEMENT。
  function createElement (type, props, ...children) {
    // 对 props 使用 ... 操作符，对入参中的 children 使用 剩余参数 , 这样 children 参数永远是数组

    return {
      type,
      props: {
        ...props,
        children: children.map((child) => {
          return typeof child === "object" ? child : createTextElement(child)
        })
      }
    }
  }
  function createTextElement (text) {
    return {
      type: "TEXT_ELEMENT",
      props: {
        nodeValue: text,
        children: []
      }
    }
  }
```

使用：

*把Didact作为自己写的库名 代替react*

```jsx
const Didact = {
    createElement,
}

const element4 = Didact.createElement(
"div",
{ id: "foo" },
Didact.createElement("a", null, "bar-element4"),
Didact.createElement("b")
)
console.log(element4)

```



## render

1.  render (*element*, *container*) 将节点node渲染到对应的DOM（container）上

2. 需要判断node的类型 如果是文本节点 则通过createTextNode渲染 ，如果是普通节点，那么创建该节点元素document.createElement(*element*.type)

3. 对子节点做递归处理，来渲染到容器中。

```jsx
function render (element, container) {
    // 根据element中的type属性创建DOM节点 再将新节点添加到容器中
    // 当element是TEXT_ELEMENT时，我们创建一个text节点 而不是普通的节点
    const dom = element.type === "TEXT_ELEMENT" ? document.createTextNode("") :
      document.createElement(element.type)

    //把element的属性赋值给node
    const isProperty = key => key !== "children"
    Object.keys(element.props).filter(isProperty).forEach(name => {
      dom[name] = element.props[name]
    })

    // 对子节点递归做相同的处理
    element.props.children.forEach(child =>
      render(child, dom)
    )

    container.appendChild(dom)

}
```

