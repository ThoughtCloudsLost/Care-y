/**
* | output |
* | --- |
* | "Organization details saved" |
*
* @param {Admin_Org_Basics_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_org_basics_saved: ((inputs?: Admin_Org_Basics_SavedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Org_Basics_SavedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Org_Basics_SavedInputs = {};
