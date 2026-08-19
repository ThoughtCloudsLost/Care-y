/**
* | output |
* | --- |
* | "The three user icons on the left side switch between Admin, Manager, and Volunteer accounts, and switching changes what every screen shows and what actions a..." |
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
