/**
* | output |
* | --- |
* | "Customize the public intake page fields" |
*
* @param {Hub_Intake_Forms_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_intake_forms_subtitle: ((inputs?: Hub_Intake_Forms_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Intake_Forms_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Intake_Forms_SubtitleInputs = {};
