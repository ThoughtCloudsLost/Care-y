/**
* | output |
* | --- |
* | "Resize the data flow panel. Use the arrow keys to change its height." |
*
* @param {Demo_Flow_ResizeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_resize: ((inputs?: Demo_Flow_ResizeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_ResizeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_ResizeInputs = {};
