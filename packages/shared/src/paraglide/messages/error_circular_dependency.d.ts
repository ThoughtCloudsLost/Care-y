/**
* | output |
* | --- |
* | "Circular dependency detected." |
*
* @param {Error_Circular_DependencyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_circular_dependency: ((inputs?: Error_Circular_DependencyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Circular_DependencyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Circular_DependencyInputs = {};
