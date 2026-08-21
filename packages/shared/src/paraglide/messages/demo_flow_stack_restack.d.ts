/**
* | output |
* | --- |
* | "Stack these steps back up" |
*
* @param {Demo_Flow_Stack_RestackInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_stack_restack: ((inputs?: Demo_Flow_Stack_RestackInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Stack_RestackInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Stack_RestackInputs = {};
