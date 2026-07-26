/**
* | output |
* | --- |
* | "Select a feature from the list to begin." |
*
* @param {Demo_Placeholder_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_placeholder_body: ((inputs?: Demo_Placeholder_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Placeholder_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Placeholder_BodyInputs = {};
