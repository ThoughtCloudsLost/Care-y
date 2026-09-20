/**
* | output |
* | --- |
* | "Feature coming soon" |
*
* @param {Feature_Coming_SoonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const feature_coming_soon: ((inputs?: Feature_Coming_SoonInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Feature_Coming_SoonInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Feature_Coming_SoonInputs = {};
