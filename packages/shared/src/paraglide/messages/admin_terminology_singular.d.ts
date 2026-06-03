/**
* | output |
* | --- |
* | "Singular" |
*
* @param {Admin_Terminology_SingularInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_singular: ((inputs?: Admin_Terminology_SingularInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Terminology_SingularInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Terminology_SingularInputs = {};
