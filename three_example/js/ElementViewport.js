function isElementInViewport (el) {
    // From http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
    // Modified so true is partially visible

    //special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
        rect.bottom >= 0 &&
        rect.right >= 0 &&
        rect.top <= jQuery(window).height() &&
        rect.left <= jQuery(window).width()
    );
}
