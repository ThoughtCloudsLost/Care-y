/**
* | output |
* | --- |
* | "In place" |
*
* @param {Demo_Flow_Direction_LocalInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_direction_local: ((inputs?: Demo_Flow_Direction_LocalInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Direction_LocalInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Direction_LocalInputs = {};
