/**
* | output |
* | --- |
* | "Voicemail routed to ticket" |
*
* @param {Admin_Quarantine_Route_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_route_success: ((inputs?: Admin_Quarantine_Route_SuccessInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Quarantine_Route_SuccessInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Quarantine_Route_SuccessInputs = {};
