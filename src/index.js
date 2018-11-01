"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var FakeReact_1 = require("./FakeReact");
var rootE1 = document.getElementById('root');
var Button = /** @class */ (function (_super) {
    __extends(Button, _super);
    function Button() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Button.prototype.render = function () {
        return {
            type: 'button',
            props: []
        };
    };
    return Button;
}(FakeReact_1.ReactComponent));
function App() {
    return {
        type: 'div',
        props: {
            children: [
                { type: Button },
                { type: Button }
            ]
        }
    };
}
var app = { type: App };
if (!rootE1) {
    throw new Error('`getElementById` failed');
}
var instance = FakeReact_1.mountTree(app, rootE1);
console.log('instance is: ', instance);
