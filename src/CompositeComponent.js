"use strict";
exports.__esModule = true;
var FakeReact_1 = require("./FakeReact");
var CompositeComponent = /** @class */ (function () {
    function CompositeComponent(element) {
        this.currentElement = element;
    }
    CompositeComponent.prototype.getPublicInstance = function () {
        return this.publicInstance;
    };
    CompositeComponent.prototype.mount = function () {
        var element = this.currentElement;
        var type = element.type;
        var props = element.props;
        if (typeof type === 'string') {
            throw new Error('type of `CompositeComponent` should not be `string`');
        }
        var renderElement;
        if (typeof type === 'function') {
            renderElement = type(props);
        }
        else {
            var publicInstance = new type(props);
            publicInstance.props = props;
            publicInstance.componentWillMount();
            renderElement = publicInstance.render();
            this.publicInstance = publicInstance;
        }
        var renderedComponent = FakeReact_1.instantiateComponent(renderElement);
        this.renderedComponent = renderedComponent;
        return renderedComponent.mount();
    };
    return CompositeComponent;
}());
exports.CompositeComponent = CompositeComponent;
