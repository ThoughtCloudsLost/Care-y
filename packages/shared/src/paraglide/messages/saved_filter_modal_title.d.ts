/**
* | output |
* | --- |
* | "Save Filter" |
*
* @param {Saved_Filter_Modal_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const saved_filter_modal_title: ((inputs?: Saved_Filter_Modal_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Saved_Filter_Modal_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Saved_Filter_Modal_TitleInputs = {};
