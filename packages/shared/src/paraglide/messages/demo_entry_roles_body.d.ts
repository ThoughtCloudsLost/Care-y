/**
* | output |
* | --- |
* | "The user badge at the right end of the toolbar opens a dropdown to switch between Admin, Manager, and Volunteer accounts, and switching changes what every sc..." |
*
* @param {Demo_Entry_Roles_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_roles_body: ((inputs?: Demo_Entry_Roles_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Entry_Roles_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Entry_Roles_BodyInputs = {};
