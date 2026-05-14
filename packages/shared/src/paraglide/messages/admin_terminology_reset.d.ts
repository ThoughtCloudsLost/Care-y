/**
* | output |
* | --- |
* | "Reset {language}" |
*
* @param {Admin_Terminology_ResetInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_reset: ((inputs: Admin_Terminology_ResetInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Terminology_ResetInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Terminology_ResetInputs = {
    language: NonNullable<unknown>;
};
