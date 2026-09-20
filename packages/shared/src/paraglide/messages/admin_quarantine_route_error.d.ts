/**
* | output |
* | --- |
* | "Failed to route voicemail" |
*
* @param {Admin_Quarantine_Route_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_route_error: ((inputs?: Admin_Quarantine_Route_ErrorInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Quarantine_Route_ErrorInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Quarantine_Route_ErrorInputs = {};
