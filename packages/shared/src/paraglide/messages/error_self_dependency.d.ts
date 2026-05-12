/**
* | output |
* | --- |
* | "A {ticket} cannot depend on itself." |
*
* @param {Error_Self_DependencyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_self_dependency: ((inputs: Error_Self_DependencyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Self_DependencyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Self_DependencyInputs = {
    ticket: NonNullable<unknown>;
};
