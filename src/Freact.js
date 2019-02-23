import { SpecialElementTypes } from './constants'

/**
 * @param {string | Function} type - type of the element, a real dom node type of a vdom definition
 * @param {Object} props - needed properties
 * @param {Object | Object[]} children - children of the element
 */
function createElement(type, props, ...children) {
  let flattenedChildren = children
  if (children.length === 1 && children[0] instanceof Array) {
    flattenedChildren = children[0]
  }
  // const childrenForProps = convertSpecialElements(flattenedChildren)
  const realProps = props ? props : {}
  // realProps.children = childrenForProps
  realProps.children = flattenedChildren

  return {
    type,
    props: realProps
  }
}

function createNullElement(key) {
  const ret = { type: SpecialElementTypes.NULL, props: {} }
  if (key) {
    ret.props.key = `${key}`
  }
  return ret
}

function createTextElement(text, key) {
  const ret = {
    type: SpecialElementTypes.TEXT,
    props: { text }
  }
  if (key) {
    ret.props.key = `${key}`
  }
  return ret
}

class Component {
  isFreactComponent() {
    return {}
  }
}

export { createElement, Component, createNullElement, createTextElement }
