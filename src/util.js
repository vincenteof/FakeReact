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

export {
    isClass,
    isText
}