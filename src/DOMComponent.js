"use strict";
exports.__esModule = true;
var FakeReact_1 = require("./FakeReact");
var DOMComponent = /** @class */ (function () {
    function DOMComponent(element) {
        this.currentElement = element;
    }
    DOMComponent.prototype.getPublicInstance = function () {
        return this.node;
    };
    DOMComponent.prototype.mount = function () {
        var type = this.currentElement.type;
        var props = this.currentElement.props;
        if (typeof type !== 'string') {
            throw new Error('type of `DOMComponent` should be `string`');
        }
        var children = props.children || {};
        if (!Array.isArray(children)) {
            children = [children];
        }
        var node = document.createElement(type);
        this.node = node;
        Object.keys(props).forEach(function (key) {
            if (key !== 'children') {
                node.setAttribute(key, props[key]);
            }
        });
        var renderedChildren = children.map(FakeReact_1.instantiateComponent);
        this.renderedChildren = renderedChildren;
        var childNodes = renderedChildren.map(function (child) { return child.mount(); });
        childNodes.forEach(function (childNode) { return node.appendChild(childNode); });
        return node;
    };
    return DOMComponent;
}());
exports.DOMComponent = DOMComponent;
