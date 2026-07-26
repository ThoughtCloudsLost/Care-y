/**
* | output |
* | --- |
* | "Called" |
*
* @param {Admin_Quarantine_CalledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_called: ((inputs?: Admin_Quarantine_CalledInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Quarantine_CalledInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Quarantine_CalledInputs = {};
