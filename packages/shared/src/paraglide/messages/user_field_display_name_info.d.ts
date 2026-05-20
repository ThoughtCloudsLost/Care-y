/**
* | output |
* | --- |
* | "Visible to other {volunteers} in your organization. End-to-end encrypted." |
*
* @param {User_Field_Display_Name_InfoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const user_field_display_name_info: ((inputs: User_Field_Display_Name_InfoInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<User_Field_Display_Name_InfoInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type User_Field_Display_Name_InfoInputs = {
    volunteers: NonNullable<unknown>;
};
