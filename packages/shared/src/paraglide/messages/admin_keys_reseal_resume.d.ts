/**
* | output |
* | --- |
* | "Resume" |
*
* @param {Admin_Keys_Reseal_ResumeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_keys_reseal_resume: ((inputs?: Admin_Keys_Reseal_ResumeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Keys_Reseal_ResumeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Keys_Reseal_ResumeInputs = {};
