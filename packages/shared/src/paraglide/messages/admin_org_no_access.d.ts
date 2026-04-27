/**
* | output |
* | --- |
* | "You do not have permission to access organization settings." |
*
* @param {Admin_Org_No_AccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_org_no_access: ((inputs?: Admin_Org_No_AccessInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Org_No_AccessInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Org_No_AccessInputs = {};
