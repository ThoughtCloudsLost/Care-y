/**
* | output |
* | --- |
* | "Simulate" |
*
* @param {Demo_Mode_ExploreInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_mode_explore: ((inputs?: Demo_Mode_ExploreInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Mode_ExploreInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Mode_ExploreInputs = {};
