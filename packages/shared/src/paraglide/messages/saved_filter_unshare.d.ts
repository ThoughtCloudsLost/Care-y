/**
* | output |
* | --- |
* | "Unshare" |
*
* @param {Saved_Filter_UnshareInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const saved_filter_unshare: ((inputs?: Saved_Filter_UnshareInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Saved_Filter_UnshareInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Saved_Filter_UnshareInputs = {};
