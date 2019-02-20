import invariant from 'invariant'

// it checks whether a class is a subclass of freact component
function isClass(type) {
  // Freact.Component subclasses have this flag
  return (
    Boolean(type.prototype) && Boolean(type.prototype.isFreactComponent)
  )
}

// it checks whether a react child(element) is just text
function isText(child) {
  return typeof child === 'undefined'
}

// attach event listener to dom node
function attachListenerToNode(node, prop, listener) {
  const eventName = prop.startsWith('on')
    ? prop.substr(2, prop.length)
    : prop
  if (eventName && eventName.length !== 0) {
    node.addEventListener(eventName, listener)
  }
}

// remove event listener from dom node
function removeListenerFromNode(node, prop, listener) {
  const eventName = prop.startsWith('on')
    ? prop.substr(2, prop.length)
    : prop
  if (eventName && eventName.length !== 0) {
    node.removeEventListener(eventName, listener)
  }
}

// whether an object is null
function isNull(obj) {
  return Object.is(obj, null)
}

// move node to some position after referenceNode
function moveNodeAfter(parent, node, referenceNode, pos) {
  let iterIndex = pos
  let sibling = referenceNode.nextSibling
  if (isNull(sibling)) {
    invariant(
      referenceNode === parent.lastChild,
      'referenceNode should be the child'
    )
    invariant(pos === 0, 'position for last child can only be zero')
    parent.appendChild(node)
    return
  }

  while (iterIndex > 0) {
    if (isNull(sibling)) {
      invariant(false, 'position should not exceed the total children')
    }
    sibling = sibling.nextSibling
    iterIndex -= 1
  }

  parent.insertBefore(node, sibling)
}

export {
  isClass,
  isText,
  attachListenerToNode,
  removeListenerFromNode,
  isNull,
  moveNodeAfter
}
