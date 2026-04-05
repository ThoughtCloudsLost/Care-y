/**
* | output |
* | --- |
* | "Save Filter" |
*
* @param {Saved_Filter_Modal_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const saved_filter_modal_title: ((inputs?: Saved_Filter_Modal_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Saved_Filter_Modal_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Saved_Filter_Modal_TitleInputs = {};
