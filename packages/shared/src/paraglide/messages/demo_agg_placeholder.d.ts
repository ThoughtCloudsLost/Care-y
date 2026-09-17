/**
* | output |
* | --- |
* | "This view is coming soon." |
*
* @param {Demo_Agg_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_agg_placeholder: ((inputs?: Demo_Agg_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Agg_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Agg_PlaceholderInputs = {};
