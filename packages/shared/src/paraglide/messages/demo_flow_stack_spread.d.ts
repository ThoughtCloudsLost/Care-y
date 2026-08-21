/**
* | output |
* | --- |
* | "Spread these steps apart" |
*
* @param {Demo_Flow_Stack_SpreadInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_stack_spread: ((inputs?: Demo_Flow_Stack_SpreadInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Stack_SpreadInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Stack_SpreadInputs = {};
