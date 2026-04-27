/**
* | output |
* | --- |
* | "They will be logged out immediately and lose access to organization data. To restore access later, you will need to reactivate their account and re-share the..." |
*
* @param {Admin_Deactivate_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_deactivate_body: ((inputs?: Admin_Deactivate_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Deactivate_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Deactivate_BodyInputs = {};
