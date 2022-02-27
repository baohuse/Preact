// 使用fiber结构来构建的

/**
 * 当浏览器空闲时去执行工作单元，工作单元中基于 element 创建的虚拟树去创建fiber结构，并返回下一个工作单元
 * fiber树的结构如下
 * this.return = null; // 父节点
 * this.child = null; // 第一个子节点
 * this.sibling = null; // 兄弟节点
 */

// 工作但愿
let nextUnitOfWork = null;

/**
 * 将虚拟 DOM 转换为真实 DOM 并添加到容器中
 * @param {element} 虚拟 DOM
 * @param {container} 真实 DOM
 */
function render(element, container) {
  // 将根节点设置为第一个将要工作单元
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
}

/**
 * 创建DOM
 * @param {*} fiber fiber节点
 * @returns dom 真实dom节点
 */
function createDom(fiber) {
  const dom =
    fiber.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);
  const isProperty = (key) => key !== "children";
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });
  return dom;
}

/**
 * 处理工作单元，返回下一个工作单元
 * @param {*} fiber
 */
function performUnitOfWork(fiber) {
  /* 处理当前fiber节点 */

  // 如果fiber上没有dom节点，为其创建一个
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

   // 如果fiber有父节点，将fiber.dom添加到父节点 
  if (fiber.parent) {
    debugger;
    fiber.parent.dom.appendChild(fiber.dom);
  }

  /* 处理当前fiber节点 */

  /* 为每一个孩子节点创建新的fiber */

  // 获取当前fiber的子节点
  const elements = fiber.props.children;

  // 当前索引
  let index = 0;

  // 上一个兄弟节点
  let prevSibling = null;

  while (index < elements.length) {
    const element = elements[index];

    // 创建fiber
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    // 将第一个孩子节点设置为 fiber 的子节点

    if (index === 0) {
      fiber.child = newFiber;
    } else if (element) {
      // 第一个之外的子节点设置为第一个子节点的兄弟节点

      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }

  /** 寻找下一个工作单元，先查找孩子，然后兄弟，如果没有就返回父节点 */

  console.log('feber', fiber);

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
      // 如果有兄弟节点，返回兄弟节点
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    // 否则返回父节点
    nextFiber = nextFiber.parent;
  }
}

/**
 * 工作循环
 * @param {*} deadline
 */
function workLoop(deadline) {
  // 停止循环标识
  let shouldYield = false;
  // 循环条件为存在下一个工作单元，且没有更高优先级的工作
  if (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // 当前帧空余时间要没了，停止工作循环
    shouldYield = deadline.timeRemaining() < 1;
  }

  // 空闲时间执行任务
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);



// 测试


const element = {
    "type": "div",
    "props": {
        "children": [
            {
                "type": "h1",
                "props": {
                    "children": [
                        {
                            "type": "p",
                            "props": {
                                "children": [
                                    {
                                        "type": "TEXT_ELEMENT",
                                        "props": {
                                            "nodeValue": "我是P标签",
                                            "children": []
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "type": "a",
                            "props": {
                                "children": []
                            }
                        }
                    ]
                }
            },
            {
                "type": "h2",
                "props": {
                    "children": []
                }
            }
        ]
    }
} 


