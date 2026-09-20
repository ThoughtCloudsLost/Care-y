/**
* | output |
* | --- |
* | "Reusable reply templates for {volunteers}" |
*
* @param {Admin_Presets_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_presets_subtitle: ((inputs: Admin_Presets_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Presets_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Presets_SubtitleInputs = {
    volunteers: NonNullable<unknown>;
};
