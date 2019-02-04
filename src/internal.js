
/*
** These classes are just implementation details, and has nothing to do with the public api.
** They are transparent to outer environment.
*/

class CompositeComponent {
    constructor(element) {
        this.currentElement = element
        this.publicInstance = null
        this.renderedComponent = null
    }

    getPublicInstance() {
        return this.getPublicInstance()
    }

    /**
     * @returns {Node} - the real dom node which is already mounted
     */
    mount() {
        const element = this.currentElement
        const { type, props } = element
        let instance = null
        let renderedElement
        if (type.isFreactComponent && type.isFreactComponent()) {
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

        Object.keys(props).forEach((k) => {
            if (k !== 'children') {
                node.setAttribute(k, props[k])
            }
        })
        // we need to instantiate all child element to get all read dom nodes
        const renderedChildren = children.map(instantiate)
        this.renderedChildren = renderedChildren

        const childNodes = renderedChildren.map(item => item.mount())
        childNodes.forEach(child => node.appendChild(child))

        return node
    }
}

// special kind of dom node
class TextComponent {
    constructor(text) {
        this.text = text
        this.node = null
    }

    getPublicInstance() {
        return this.node
    }

    mount() {
        const text = this.text
        const node = document.createElement('span')
        this.node = node
        node.innerText = text
        return node
    }
}

/**
 * @param {Object} element - react element or some text
 * @returns {CompositeComponent | DOMComponent} - an internal instance of the react element 
 */
function instantiate(element) {
    if (typeof element === 'string') {
        return new TextComponent(element)
    }

    const { type } = element
    let renderedComponent
    if (typeof type === 'function') {
        renderedComponent = new CompositeComponent(element) 
    } else if (typeof type === 'string') {
        renderedComponent = new DOMComponent(element)
    }
    return renderedComponent
}

export {
    CompositeComponent,
    DOMComponent,
    instantiate
}