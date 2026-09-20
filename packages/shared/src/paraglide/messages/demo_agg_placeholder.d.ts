/**
* | output |
* | --- |
* | "This view is coming soon." |
*
* @param {Demo_Agg_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_agg_placeholder: ((inputs?: Demo_Agg_PlaceholderInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Agg_PlaceholderInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Agg_PlaceholderInputs = {};
