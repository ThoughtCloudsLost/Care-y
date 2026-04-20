/**
* | output |
* | --- |
* | "Messages longer than 160 characters will be split into multiple texts." |
*
* @param {Admin_Templates_Segment_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_segment_hint: ((inputs?: Admin_Templates_Segment_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Templates_Segment_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Templates_Segment_HintInputs = {};
