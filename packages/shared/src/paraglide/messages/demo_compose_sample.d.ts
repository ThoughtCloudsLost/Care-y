/**
* | output |
* | --- |
* | "Thank you for reaching out. Let me look into this for you." |
*
* @param {Demo_Compose_SampleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_compose_sample: ((inputs?: Demo_Compose_SampleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Compose_SampleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Compose_SampleInputs = {};
