/**
* | output |
* | --- |
* | "Leave this page" |
*
* @param {Portal_Quick_Exit_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_quick_exit_label: ((inputs?: Portal_Quick_Exit_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Quick_Exit_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Quick_Exit_LabelInputs = {};
