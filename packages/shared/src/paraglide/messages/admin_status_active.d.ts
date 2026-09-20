/**
* | output |
* | --- |
* | "Active" |
*
* @param {Admin_Status_ActiveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_status_active: ((inputs?: Admin_Status_ActiveInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Status_ActiveInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Status_ActiveInputs = {};
