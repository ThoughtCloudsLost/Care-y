/**
* | output |
* | --- |
* | "Delete" |
*
* @param {Saved_Filter_DeleteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const saved_filter_delete: ((inputs?: Saved_Filter_DeleteInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Saved_Filter_DeleteInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Saved_Filter_DeleteInputs = {};
