/**
* | output |
* | --- |
* | "Could not save organization details. Try again." |
*
* @param {Admin_Org_Basics_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_org_basics_error: ((inputs?: Admin_Org_Basics_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Org_Basics_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Org_Basics_ErrorInputs = {};
