/**
* | output |
* | --- |
* | "Delete" |
*
* @param {Saved_Filter_DeleteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const saved_filter_delete: ((inputs?: Saved_Filter_DeleteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Saved_Filter_DeleteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Saved_Filter_DeleteInputs = {};
