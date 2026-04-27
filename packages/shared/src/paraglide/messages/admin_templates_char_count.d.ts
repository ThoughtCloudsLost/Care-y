/**
* | output |
* | --- |
* | "{count} / {max} characters" |
*
* @param {Admin_Templates_Char_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_char_count: ((inputs: Admin_Templates_Char_CountInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Templates_Char_CountInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Templates_Char_CountInputs = {
    count: NonNullable<unknown>;
    max: NonNullable<unknown>;
};
