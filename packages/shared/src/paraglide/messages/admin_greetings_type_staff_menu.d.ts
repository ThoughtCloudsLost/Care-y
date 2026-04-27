/**
* | output |
* | --- |
* | "Staff options" |
*
* @param {Admin_Greetings_Type_Staff_MenuInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_staff_menu: ((inputs?: Admin_Greetings_Type_Staff_MenuInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Type_Staff_MenuInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Type_Staff_MenuInputs = {};
