"use strict";
exports.__esModule = true;
var CompositeComponent_1 = require("./CompositeComponent");
var DOMComponent_1 = require("./DOMComponent");
var ReactComponent = /** @class */ (function () {
    function ReactComponent() {
    }
    ReactComponent.prototype.componentWillMount = function () { };
    return ReactComponent;
}());
exports.ReactComponent = ReactComponent;
function instantiateComponent(element) {
    var type = element.type;
    if (typeof element === 'string') {
        return new DOMComponent_1.DOMComponent(element);
    }
    else {
        return new CompositeComponent_1.CompositeComponent(element);
    }
}
exports.instantiateComponent = instantiateComponent;
function mountTree(element, containerNode) {
    var rootComponent = instantiateComponent(element);
    var node = rootComponent.mount();
    containerNode.appendChild(node);
    return rootComponent.getPublicInstance();
}
exports.mountTree = mountTree;
