// it checks whether a class is a subclass of freact component
function isClass(type) {
    // Freact.Component subclasses have this flag
    return (
        Boolean(type.prototype) &&
        Boolean(type.prototype.isFreactComponent)
    )
}

// it checks whether a react child(element) is just text
function isText(child) {
    return typeof(child) === "undefined"
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

export {
    isClass,
    isText,
    attachListenerToNode,
    removeListenerFromNode
}