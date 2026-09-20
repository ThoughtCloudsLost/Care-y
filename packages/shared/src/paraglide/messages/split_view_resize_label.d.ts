/**
* | output |
* | --- |
* | "Resize panels" |
*
* @param {Split_View_Resize_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const split_view_resize_label: ((inputs?: Split_View_Resize_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Split_View_Resize_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Split_View_Resize_LabelInputs = {};
