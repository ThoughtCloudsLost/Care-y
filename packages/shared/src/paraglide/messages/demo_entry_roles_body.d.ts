/**
* | output |
* | --- |
* | "The user badge on the simulator toolbar opens a dropdown to switch between Admin, Manager, and Volunteer, and switching changes what every screen shows and w..." |
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
