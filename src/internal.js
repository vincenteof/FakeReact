
/*
** These classes are just implementation details, and has nothing to do with the public api.
** They are transparent to outer environment.
*/

class CompositeComponent {
    constructor(element) {
        this.currentElement = element   // freact element, vdom
        this.publicInstance = null      // instance of `type`
        this.renderedComponent = null   // instance of internal implementation
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
        
        // updating
        this.currentElement = nextElement
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

        // sub-level vdom just have an update on props
        if (prevRenderedElement.type === nextRenderedElement.type) {
            prevRenderedComponent.receive(nextRenderedElement)
            return
        }
        // type of sub-level vdom has changed, and a new dom node needs to be created
        const prevNode = prevRenderedComponent.getHostNode()
        prevRenderedComponent.unmount()
        const nextRenderedComponent = instantiate(nextElement)
        const nextNode = nextRenderedComponent.mount()
        this.renderedComponent = nextRenderedComponent
        prevNode.parentNode.replaceChild(nextNode, prevNode)
    }

    /**
     *  @returns {Node} - the first real dom node
     */
    getHostNode() {
        // this will recursively drill down any composites
        return this.renderedComponent.getHostNode()
    }
}

// helper function
function isClass(type) {
    // Freact.Component subclasses have this flag
    return (
        Boolean(type.prototype) &&
        Boolean(type.prototype.isFreactComponent)
    )
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
            // TODO: special handling for event handler 
            if (k.startsWith('on')) {
                const eventName = k.substr(2, k.length)
                if (eventName && eventName.length !== 0) {
                    node.addEventListener(eventName, props[k])
                }
            } else if (k !== 'children') {
                node.setAttribute(k, props[k])
            }
        })
        // we need to instantiate child elements to get all real dom nodes
        const renderedChildren = children.map(instantiate)
        this.renderedChildren = renderedChildren

        const childNodes = renderedChildren.map(item => item.mount())
        childNodes.forEach(child => node.appendChild(child))

        return node
    }

    unmount() {
        const renderedChildren = this.renderedChildren
        renderedChildren.forEach((child) => child.unmount())
    }

    receive(nextElement) {
        const node = this.node
        const prevElement = this.currentElement
        const prevProps = prevElement.props
        const nextProps = nextElement.props
        this.currentElement = nextElement

        Object.keys(prevProps).forEach((k) => {
            // TODO: special handling for event handler 
            if (k.startsWith('on')) {
                const eventName = k.substr(2, k.length)
                if (eventName && eventName.length !== 0) {
                    node.removeEventListener(eventName, prevProps[k])
                }
            } else if (k !== 'children') {
                node.removeAttribute(k)
            }
        })

        Object.keys(nextProps).forEach((k) => {
            // TODO: special handling for event handler 
            if (k.startsWith('on')) {
                const eventName = k.substr(2, k.length)
                if (eventName && eventName.length !== 0) {
                    node.addEventListener(eventName, nextProps[k])
                }
            } else if (k !== 'children') {
                node.setAttribute(k, nextProps[k])
            }
        })

        // for children
        let prevChildren = prevProps.children || [];
        if (!Array.isArray(prevChildren)) {
          prevChildren = [prevChildren];
        }
        let nextChildren = nextProps.children || [];
        if (!Array.isArray(nextChildren)) {
          nextChildren = [nextChildren];
        }

        const prevRenderedChildren = this.renderedChildren
        const nextRenderedChildren = []
        const operationQueue = []

        for (let i = 0; i < nextChildren.length; i++) {
            // add new node
            const prevChild = prevRenderedChildren[i]
            if (!prevChild) {
                const nextChild = instantiate(nextChildren[i])
                const node = nextChild.mount()
                operationQueue.push({ type: 'ADD', node })
                nextRenderedChildren.push(nextChild)
                continue
            }
            // replace node of different types
            const canUpdate = (isText(prevChildren[i]) && isText(nextChildren[i])) 
                || (prevChildren[i].type === nextChildren[i].type)

            if (!canUpdate) {
                const prevNode = prevChild.getHostNode()
                prevChild.unmount()
                const nextChild = instantiate(nextChildren[i])
                const nextNode = nextChild.mount()
                operationQueue.push({ type: 'REPLACE', prevNode, nextNode })
                nextRenderedChildren.push(nextChild)
                continue
            }
            // just update props
            prevChild.receive(nextChildren[i])
            nextRenderedChildren.push(prevChild)
        }

        // unmount node not exists
        for (let j = nextChildren.length; j < prevChildren.length; j++) {
            const prevChild = prevRenderedChildren[j]
            const node = prevChild.getHostNode()
            prevChild.unmount()
            operationQueue.push({ type: 'REMOVE', node })
        }

        this.renderedChildren = nextRenderedChildren

        // execute the batch operation
        while (operationQueue.length > 0) {
            const operation = operationQueue.shift()
            switch (operation.type) {
                case 'ADD':
                    this.node.appendChild(operation.node)
                    break
                case 'REPLACE':
                    this.node.replaceChild(operation.nextNode, operation.prevNode)
                    break
                case 'REMOVE':
                    this.node.removeChild(operation.node)
                    break
                default: 
                    console.error('unknow type of operation')
                    break
            }
        }
    }

    getHostNode() {
        return this.node
    }  
}

function isText(child) {
    return typeof(child) === "undefined"
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

    // avoid null pointer for the method reference
    unmount() { 
        console.log(`unmount for text "${this.text}"`) 
    }

    receive(nextElement) {
        this.node.innerText = nextElement
    }

    getHostNode() {
        return this.node
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