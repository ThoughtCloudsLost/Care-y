/**
* | output |
* | --- |
* | "Connection removed" |
*
* @param {Admin_Donations_Connection_RemovedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_connection_removed: ((inputs?: Admin_Donations_Connection_RemovedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Donations_Connection_RemovedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Donations_Connection_RemovedInputs = {};
