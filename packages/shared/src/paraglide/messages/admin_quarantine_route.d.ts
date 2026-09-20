/**
* | output |
* | --- |
* | "Route to ticket" |
*
* @param {Admin_Quarantine_RouteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_route: ((inputs?: Admin_Quarantine_RouteInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Quarantine_RouteInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Quarantine_RouteInputs = {};
