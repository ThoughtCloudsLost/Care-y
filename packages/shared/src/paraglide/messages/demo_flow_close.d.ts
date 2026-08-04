/**
* | output |
* | --- |
* | "Close the data flow panel" |
*
* @param {Demo_Flow_CloseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_close: ((inputs?: Demo_Flow_CloseInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_CloseInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_CloseInputs = {};
