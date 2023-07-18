import ReactDOM from 'react-dom'
import React from 'react'
const createElement = () => {

  // // React相关使用
  // const element = <h1 title="foo">Hello</h1> //定义一个React element
  // const container = document.getElementById('root') //从DOM中拿到一个节点
  // ReactDOM.render(element, container) //将元素渲染到容器中

  // 1. const element = <h1 title="foo">Hello</h1>
  // 创建元素——createElement
  // const element=React.createElement()
  const element1 = React.createElement(
    'h1',
    { title: 'foo' },
    "hello"
  )
  // 一个JSX元素就是带有type和props属性的对象。type指定了DOM节点的类型，即标签名  props是个对象，从JSX属性中接收所有的key、value，并且有一个特别的属性children
  const element = {
    type: 'h1',
    props: {
      title: 'foo',
      children: 'Hello吖'
    }
  }

  const container = document.getElementById('root')

  // 2. ReactDOM.render(element, container)
  const node = document.createElement(element.type) //根据传入的type创建一个新的节点node
  node["title"] = element.props.title //把props中的属性传给node
  // 然后创建node的子节点children——是文本节点
  const text = document.createTextNode("")
  text['nodeValue'] = element.props.children
  // 把textNode添加到h1里面，把h1添加到container里。
  node.appendChild(text)
  container.appendChild(node)


  // 例子：
  const element2 = (
    <div id="foo">
      <a>bar</a>
      <b />
    </div>
  )
  // const container=document.getElementById('root')
  // ReactDOM.render(element2, container)

  // 转为js查看 
  const element3 = React.createElement(
    "div",
    { id: "foo" },
    React.createElement("a", null, "bar"),
    React.createElement("b")
  )
  console.log(element3)

  // createElement就是创建一个带有type和props的对象
  // function createElement (type, props, ...children) {
  //   // 对 props 使用 ... 操作符，对入参中的 children 使用 剩余参数 , 这样 children 参数永远是数组
  //   return {
  //     type,
  //     props: {
  //       ...props,
  //       children
  //     }
  //   }
  // }
  // 使用：
  // createElement("div") ==> 
  // {
  //   type: "div",
  //     props: {
  //     "children": []
  //   }
  // }
  // createElement("div",null,a) ==> 
  // {
  //   type: "div",
  //     props: {
  //     "children": [a]
  //   }
  // }
  // createElement("div",null,a,b) ==> 
  // {
  //   type: "div",
  //     props: {
  //     "children": [a,b]
  //   }
  // }

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


  // Render
  function render1 (element, container) {
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

  // 创建 DOM节点抽离出函数
  function createDom (fiber) {
    const dom = element.type === "TEXT_ELEMENT" ? document.createTextNode("") :
      document.createElement(element.type)

    //把element的属性赋值给node
    const isProperty = key => key !== "children"
    Object.keys(element.props).filter(isProperty).forEach(name => {
      dom[name] = element.props[name]
    })
    return dom
  }
  let nextUnitOfWork = null
  function render (element, container) {
    // render 函数中我们把 nextUnitOfWork 置为 fiber 树的根节点。
    nextUnitOfWork = {
      dom: container,
      props: {
        children: [element]
      }
    }
  }

  // 把Didact作为自己写的库名
  const Didact = {
    createElement,
    render
  }

  const element4 = Didact.createElement(
    "div",
    { id: "foo" },
    Didact.createElement("a", null, "bar-element4"),
    Didact.createElement("b")
  )
  console.log(element4)

  Didact.render(element4, container)


  // let nextUnitOfWork = null

  // deadline 参数。我们可以通过它来判断离浏览器再次拿回控制权还有多少时间。
  function workLoop (deadline) {
    let shouldYield = false
    while (nextUnitOfWork && !shouldYield) {
      // 我们需要先设置渲染的第一个任务单元，然后开始循环。
      // performUnitOfWork 函数不仅需要执行每一小块的任务单元，还需要返回下一个任务单元。
      nextUnitOfWork = performUnitOfWork(
        nextUnitOfWork
      )
      shouldYield = deadline.timeRemaining() < 1
    }
    requestIdleCallback(workLoop)
  }

  requestIdleCallback(workLoop)

  function performUnitOfWork (fiber) {
    if (!fiber.dom) {
      fiber.dom = createDom(fiber)
    }
    if (fiber.parent) {
      fiber.parent.dom.appendChild(fiber.dom)
    }
  }


}

export default createElement