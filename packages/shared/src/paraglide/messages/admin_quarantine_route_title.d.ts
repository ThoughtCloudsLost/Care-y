/**
* | output |
* | --- |
* | "Route voicemail" |
*
* @param {Admin_Quarantine_Route_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_route_title: ((inputs?: Admin_Quarantine_Route_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Quarantine_Route_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Quarantine_Route_TitleInputs = {};
