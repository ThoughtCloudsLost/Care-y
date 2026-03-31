/**
* | output |
* | --- |
* | "Circular dependency detected." |
*
* @param {Error_Circular_DependencyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_circular_dependency: ((inputs?: Error_Circular_DependencyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Circular_DependencyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Circular_DependencyInputs = {};
