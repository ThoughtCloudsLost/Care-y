/**
* | output |
* | --- |
* | "Display Name" |
*
* @param {User_Field_Display_Name_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const user_field_display_name_label: ((inputs?: User_Field_Display_Name_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<User_Field_Display_Name_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type User_Field_Display_Name_LabelInputs = {};
