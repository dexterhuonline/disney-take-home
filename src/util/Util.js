/**
 * Returns whether or not an element is visible on screen.
 * @param element The element to check.
 * @returns True if the element is visible on screen.
 */
export function isElementInView(element) {
    const bounds = element.getBoundingClientRect();
    return bounds.top < window.innerHeight && bounds.bottom >= 0;
}

/**
 * Returns whether or not an element is completely visible on screen.
 * @param element The element to check.
 * @returns True if the element is visible on screen.
 */
export function isElementCompletelyInView(element) {
    const bounds = element.getBoundingClientRect();
    return bounds.top >= 0 && bounds.bottom <= window.innerHeight;
}