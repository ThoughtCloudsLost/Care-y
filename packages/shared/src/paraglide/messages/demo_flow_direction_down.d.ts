/**
* | output |
* | --- |
* | "Response" |
*
* @param {Demo_Flow_Direction_DownInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_direction_down: ((inputs?: Demo_Flow_Direction_DownInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Direction_DownInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Direction_DownInputs = {};
