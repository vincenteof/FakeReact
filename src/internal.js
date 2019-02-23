import {
  isClass,
  attachListenerToNode,
  removeListenerFromNode,
  insertAfter
} from './util'
import { diff } from './diff'
import {
  createElement,
  createNullElement,
  createTextElement
} from './Freact'
import { SpecialElementTypes, OperationTypes } from './constants'
import warning from 'warning'

/*
 ** These classes are just implementation details, and has nothing to do with the public api.
 ** They are transparent to outer environment.
 */

class CompositeComponent {
  constructor(element) {
    this.currentElement = element // freact element, vdom
    this.publicInstance = null // instance of `type`
    this.renderedComponent = null // instance of internal implementation
  }

  getPublicInstance() {
    return this.publicInstance
  }

  /**
   * @returns {Node} - the real dom node which is already mounted
   */
  mount() {
    const element = this.currentElement
    const { type, props } = element
    let instance = null
    let renderedElement
    if (isClass(type)) {
      instance = new type(props)
      // set the props to the intance for latter updating
      instance.props = props
      this.publicInstance = instance
      if (instance.componentWillMount) {
        instance.componentWillMount()
      }
      renderedElement = instance.render()
    } else {
      renderedElement = type(props)
    }
    const renderedComponent = instantiate(renderedElement)
    this.renderedComponent = renderedComponent
    return renderedComponent.mount()
  }

  unmount() {
    const instance = this.publicInstance
    if (instance.componentWillUnmount) {
      instance.componentWillMount()
    }
    const renderedComponent = this.renderedComponent
    renderedComponent.unmount()
  }

  // when a composite component receives a new element,
  // it may either delegate the update to its rendered internal instance,
  // or unmount it and mount a new one in its place
  receive(nextElement) {
    // store previous rendered result
    const instance = this.publicInstance
    const prevRenderedComponent = this.renderedComponent
    const prevRenderedElement = prevRenderedComponent.currentElement
    const nextType = nextElement.type
    const nextProps = nextElement.props

    // notice that both `nextRenderedElement` and `prevRenderedElement` refer to sub-level vdom,
    // works to do in this level has been done in a parent-level
    let nextRenderedElement
    if (isClass(nextType)) {
      if (instance.componentWillUpdate) {
        instance.componentWillUpdate(nextProps)
      }
      // update the props and make a render
      instance.props = nextProps
      nextRenderedElement = instance.render()
    } else {
      nextRenderedElement = nextType(nextProps)
    }
    if (nextRenderedElement === null) {
      nextRenderedElement = createNullElement()
    } else if (typeof nextRenderedElement === 'string') {
      nextRenderedElement = createTextElement(nextRenderedElement)
    }

    // sub-level vdom just have an update on props
    const sameType = prevRenderedElement.type === nextRenderedElement.type
    if (sameType) {
      prevRenderedComponent.receive(nextRenderedElement)
      return
    }

    // type of sub-level vdom has changed, and a new dom node needs to be created
    const prevNode = prevRenderedComponent.getHostNode()
    prevRenderedComponent.unmount()
    const nextRenderedComponent = instantiate(nextElement)
    const nextNode = nextRenderedComponent.mount()
    this.renderedComponent = nextRenderedComponent
    if (nextNode === null) {
      prevNode.parentNode.removeChild(prevNode)
    } else {
      prevNode.parentNode.replaceChild(nextNode, prevNode)
    }

    // updating
    this.currentElement = nextElement
  }

  /**
   *  @returns {Node} - the first real dom node
   */
  getHostNode() {
    // this will recursively drill down any composites
    return this.renderedComponent.getHostNode()
  }
}

class DOMComponent {
  constructor(element) {
    this.currentElement = element
    this.renderedChildren = []
    this.node = null
  }

  getPublicInstance() {
    return this.node
  }

  /**
   * @returns {Node} - the real dom node which is already mounted
   */
  mount() {
    const element = this.currentElement
    const { type, props } = element

    const node = document.createElement(type)
    this.node = node

    let children = props.children || []
    if (!Array.isArray(children)) {
      children = [children]
    }

    Object.keys(props).forEach(k => {
      // TODO: special handling for event handler
      if (k.startsWith('on')) {
        attachListenerToNode(node, k, props[k])
      } else if (k !== 'children') {
        node.setAttribute(k, props[k])
      }
    })
    // we need to instantiate child elements to get all real dom nodes
    const renderedChildren = children.map((child, idx) => {
      const component = instantiate(child)
      component._mountedIndex = idx
      return component
    })
    this.renderedChildren = renderedChildren

    const childNodes = renderedChildren.map(item => item.mount())
    childNodes.forEach(child => {
      if (child !== null) {
        node.appendChild(child)
      }
    })

    return node
  }

  unmount() {
    const renderedChildren = this.renderedChildren
    renderedChildren.forEach(child => child.unmount())
  }

  receive(nextElement) {
    const node = this.node
    const prevElement = this.currentElement
    const prevProps = prevElement.props
    const nextProps = nextElement.props
    this.currentElement = nextElement

    Object.keys(prevProps).forEach(k => {
      // TODO: special handling for event handler
      if (k.startsWith('on')) {
        removeListenerFromNode(node, k, prevProps[k])
      } else if (k !== 'children') {
        node.removeAttribute(k)
      }
    })

    Object.keys(nextProps).forEach(k => {
      // TODO: special handling for event handler
      if (k.startsWith('on')) {
        attachListenerToNode(node, k, nextProps[k])
      } else if (k !== 'children') {
        node.setAttribute(k, nextProps[k])
      }
    })

    // for children
    let prevChildren = prevProps.children || []
    if (!Array.isArray(prevChildren)) {
      prevChildren = [prevChildren]
    }
    let nextChildren = nextProps.children || []
    if (!Array.isArray(nextChildren)) {
      nextChildren = [nextChildren]
    }

    const prevRenderedChildren = this.renderedChildren
    const [patches, nextRenderedChildren] = diff(
      prevRenderedChildren,
      nextChildren,
      instantiate
    )
    this.renderedChildren = nextRenderedChildren

    executeDOMOperations(node, patches)
  }

  getHostNode() {
    return this.node
  }
}

function executeDOMOperations(parentNode, patches) {
  while (patches.length > 0) {
    const operation = patches.shift()
    switch (operation.type) {
      case OperationTypes.INSERT:
        // parentNode.appendChild(operation.node)
        insertAfter(
          parentNode,
          operation.node,
          operation.referenceNode,
          operation.idx
        )
        break
      case OperationTypes.REPLACE:
        parentNode.replaceChild(operation.nextNode, operation.prevNode)
        break
      case OperationTypes.REMOVE:
        parentNode.removeChild(operation.node)
        break
      case OperationTypes.MOVE:
        insertAfter(
          parentNode,
          operation.node,
          operation.referenceNode,
          operation.idx
        )
        break
      default:
        warning(
          false,
          `unknow type of operation in operations queue: ${operation.type}`
        )
        break
    }
  }
}

// special kind of dom node
class TextComponent {
  constructor(text) {
    if (typeof text === 'string') {
      this.currentElement = createElement(SpecialElementTypes.TEXT, {
        text
      })
      this.text = text
    } else {
      this.currentElement = text
      this.text = text.props.text
    }
    this.node = null
  }

  getPublicInstance() {
    return this.node
  }

  mount() {
    const text = this.text
    const node = document.createTextNode(text)
    this.node = node
    return node
  }

  // avoid null pointer for the method reference
  unmount() {
    console.log(`unmount for text "${this.text}"`)
  }

  receive(nextElement) {
    this.currentElement = nextElement
    this.text = nextElement.props.text
    this.node.nodeValue = this.text
  }

  getHostNode() {
    return this.node
  }
}

// when render returns null
class NullComponent {
  constructor(element) {
    this.currentElement = element
  }

  getPublicInstance() {
    return null
  }

  mount() {
    return null
  }

  // avoid null pointer for the method reference
  unmount() {
    console.log('unmount for null')
  }

  receive() {
    console.log('receive for null')
  }

  getHostNode() {
    return null
  }
}

/**
 * @param {Object} element - react element or some text
 * @returns {CompositeComponent | DOMComponent} - an internal instance of the react element
 */
function instantiate(element) {
  const { type } = element
  if (typeof type === 'function') {
    return new CompositeComponent(element)
  }
  if (type === SpecialElementTypes.NULL) {
    return new NullComponent(element)
  }
  if (type === SpecialElementTypes.TEXT) {
    return new TextComponent(element)
  }
  return new DOMComponent(element)
}

export {
  instantiate,
  DOMComponent,
  CompositeComponent,
  TextComponent,
  NullComponent
}
