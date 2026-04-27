/**
* | output |
* | --- |
* | "Their account will be restored, but they will need a new organization key share before they can access encrypted data." |
*
* @param {Admin_Reactivate_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reactivate_body: ((inputs?: Admin_Reactivate_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Reactivate_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Reactivate_BodyInputs = {};
