"use strict";
var Main = /** @class */ (function () {
    function Main(name) {
        this.name = name;
    }
    Main.prototype.show = function (text) {
        console.log(text);
    };
    return Main;
}());
var main = new Main("Just Test");
main.show(main.name);
