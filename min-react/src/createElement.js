import React from 'react'
const create = () => {

  // // React相关使用
  // const element = <h1 title="foo">Hello</h1> //定义一个React element
  // const container = document.getElementById('root') //从DOM中拿到一个节点
  // ReactDOM.render(element, container) //将元素渲染到容器中

  // 1. const element = <h1 title="foo">Hello</h1>
  // 创建元素——createElement
  // const element=React.createElement()
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
  // container.appendChild(node)


  // 例子：
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
        children: children.map(child => {
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

  // 创建 DOM节点抽离出函数
  // 根据fiber节点创建真实的dom节点
  function createDom (fiber) {
    const dom =
      fiber.type === "TEXT_ELEMENT" ? document.createTextNode("") :
        document.createElement(fiber.type)

    // updataDom执行了相同的逻辑
    //把element的属性赋值给node
    console.log(111, fiber)
    // const isProperty = key => key !== "children"
    // Object.keys(fiber.props).filter(isProperty).forEach(name => {
    //   dom[name] = fiber.props[name]
    // })
    updateDom(dom, {}, fiber.props)
    return dom
  }

  let nextUnitOfWork = null
  let wipRoot = null
  let currentRoot = null
  let deletions = null

  // // render函数主要逻辑：
  //   根据root container容器创建root fiber
  //   将nextUnitOfWork指针指向root fiber
  //   element是react element tree
  function render (element, container) {
    console.log("render", element)
    // render 函数中我们把 nextUnitOfWork 置为 fiber 树的根节点。
    wipRoot = {
      dom: container,
      props: {
        children: [element]// 此时的element还只是React.createElement函数创建的virtual dom树
      },
      alternate: currentRoot,
    }
    console.log('wipRoot', wipRoot)
    deletions = []
    nextUnitOfWork = wipRoot
    // console.log('render')
  }

  function commitRoot () {
    deletions.forEach(commitWork)
    commitWork(wipRoot.child)
    currentRoot = wipRoot
    wipRoot = null
  }
  // 递归执行 commit，此过程不中断
  function commitWork (fiber) {
    if (!fiber) {
      return
    }
    const domParent = fiber.parent.dom
    if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
      domParent.appendChild(fiber.dom)
    } else if (fiber.effectTag === "DELETION") {
      domParent.removeChild(fiber.dom)
    } else if (fiber.effectTag === "UPDATA" && fiber.dom != null) {
      updateDom(fiber.dom, fiber.alternate.props, fiber.props)
    }
    // // 深度优先遍历，先遍历 child，后遍历 sibling
    commitWork(fiber.child)
    commitWork(fiber.sibling)
  }

  const isEvent = key => key.startsWith("on")
  const isProperty = key => key !== "children" && !isEvent(key)
  const isNew = (prev, next) => key =>
    prev[key] !== next[key]
  const isGone = (prev, next) => key => !(key in next)
  function updateDom (dom, prevProps, nextProps) {
    // Remove old properties
    Object.keys(prevProps)
      .filter(isProperty)
      .filter(isGone(prevProps, nextProps))
      .forEach(name => {
        dom[name] = ""
      })

    // Set new or changed properties
    Object.keys(nextProps)
      .filter(isProperty)
      .filter(isNew(prevProps, nextProps))
      .forEach(name => {
        dom[name] = nextProps[name]
      })
  }

  // // let nextUnitOfWork = null

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

    if (!nextUnitOfWork && wipRoot) {
      commitRoot()
    }
    requestIdleCallback(workLoop)
  }

  requestIdleCallback(workLoop)

  function reconcileChildren (wipFiber, elements) {

    // 为每个子节点创建对应的新的fiber节点

    let index = 0
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child
    let prevSibling = null
    while (index < elements.length || oldFiber != null) {
      const element = elements[index]
      let newFiber = null
      const sameType = oldFiber && element && element.type === oldFiber.type
      if (sameType) {
        // 更新节点
        newFiber = {
          type: oldFiber.type,
          props: element.props,
          dom: oldFiber.dom,
          parent: wipFiber,
          alternate: oldFiber,
          effectTag: 'UPDATE'
        }
      }
      if (element && !sameType) {
        // 增加节点
        newFiber = {
          type: element.type,
          props: element.props,
          dom: null,
          parent: wipFiber,
          alternate: null,
          effectTag: 'PLACEMENT'
        }
      }
      if (oldFiber && !sameType) {
        // 删除旧节点
        oldFiber.effectTag = "DELETION"
        deletions.push(oldFiber)
      }
      // const newFiber = {
      //   type: element.type,
      //   props: element.props,
      //   parent: wipFiber,
      //   dom: null
      // }
      // 判断是不是第一个子节点 是的话把父节点的child指向新的fiber
      if (index === 0) {
        wipFiber.child = newFiber
      } else {
        // 不是 则为上一个子节点的兄弟节点 设置sibling的指向
        prevSibling.sibling = newFiber
      }
      prevSibling = newFiber
      index++
    }
  }

  // 执行当前工作单元并设置下一个要执行的工作单元
  // performUnitOfWork函数主要逻辑：
  //   将element元素添加到DOM
  //   给element的子元素创建对应的fiber节点
  //   返回下一个工作单元，即下一个fiber节点，查找过程：
  //      1.如果有子元素，则返回子元素的fiber节点
  //      2.如果没有子元素，则返回兄弟元素的fiber节点
  //      3.如果既没有子元素又没有兄弟元素，则往上查找其父节点的兄弟元素的fiber节点
  //      4.如果往上查找到root fiber节点，说明render过程已经结束
  function performUnitOfWork (fiber) {
    // 首先创建 fiber 对应的 DOM 节点，并将它添加（append）到父节点的 DOM 上。
    if (!fiber.dom) {
      fiber.dom = createDom(fiber)
    }
    // if (fiber.parent) {
    //   fiber.parent.dom.appendChild(fiber.dom)
    // }

    const elements = fiber.props.children
    reconcileChildren(fiber, elements)

    // 找到下一个工作单元
    if (fiber.child) {
      // 有子节点 那么下一个工作单元就是它的子节点
      return fiber.child
    }
    let nextFiber = fiber
    while (nextFiber) {
      // 没有子节点则看有没有兄弟节点 有的话下一个工作单元就是它的兄弟节点
      if (nextFiber.sibling) {
        return nextFiber.sibling
      }
      // 没有兄弟节点 则往上一级的父节点去找 父节点的兄弟节点则是下一个工作单元
      nextFiber = nextFiber.parent
    }
  }


  // 把Didact作为自己写的库名
  const Didact = {
    createElement,
    render
  }

  /** @jsxRuntime classic */
  /** @jsx Didact.createElement */
  const element5 = (<div>
    <p>123</p>
    <span>536</span>
  </div>)
  Didact.render(element5, container)
  // const element4 = Didact.createElement(
  //   "div",
  //   { id: "foo" },
  //   Didact.createElement("a", null, "bar-element44"),
  //   Didact.createElement("b")
  // )
  // console.log(element4)

  // Didact.render(element4, container)

}

export default create