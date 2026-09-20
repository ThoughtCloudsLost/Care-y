/**
* | output |
* | --- |
* | "Inactive" |
*
* @param {Admin_Status_InactiveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_status_inactive: ((inputs?: Admin_Status_InactiveInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Status_InactiveInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Status_InactiveInputs = {};
