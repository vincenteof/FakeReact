/**
 * @param {string | Function} type - type of the element, a real dom node type of a vdom definition
 * @param {Object} props - needed properties
 * @param {Object | Object[]} children - children of the element
 */
function createElement(type, props, ...children) {
    let childrenForProps = children
    if (children.length === 0) {
        childrenForProps = null
    } else if (children.length === 1) {
        childrenForProps = children[0]
    }
    props.children = childrenForProps
    return {
        type,
        props
    }
}

class Component {
    isFreactComponent() {
        return {}
    }
}

export {
    createElement,
    Component
}