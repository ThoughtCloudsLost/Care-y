/**
* | output |
* | --- |
* | "End-to-end encrypted. Only your team can read this." |
*
* @param {User_Field_Display_Name_E2e_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const user_field_display_name_e2e_hint: ((inputs?: User_Field_Display_Name_E2e_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<User_Field_Display_Name_E2e_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type User_Field_Display_Name_E2e_HintInputs = {};
