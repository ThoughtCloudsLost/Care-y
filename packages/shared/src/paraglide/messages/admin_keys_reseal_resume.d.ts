/**
* | output |
* | --- |
* | "Resume" |
*
* @param {Admin_Keys_Reseal_ResumeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_keys_reseal_resume: ((inputs?: Admin_Keys_Reseal_ResumeInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Keys_Reseal_ResumeInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Keys_Reseal_ResumeInputs = {};
