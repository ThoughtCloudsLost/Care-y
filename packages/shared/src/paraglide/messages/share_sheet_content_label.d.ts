/**
* | output |
* | --- |
* | "Content" |
*
* @param {Share_Sheet_Content_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_sheet_content_label: ((inputs?: Share_Sheet_Content_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_Sheet_Content_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_Sheet_Content_LabelInputs = {};
