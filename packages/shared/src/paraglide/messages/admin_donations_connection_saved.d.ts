/**
* | output |
* | --- |
* | "Connection saved" |
*
* @param {Admin_Donations_Connection_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_connection_saved: ((inputs?: Admin_Donations_Connection_SavedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Donations_Connection_SavedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Donations_Connection_SavedInputs = {};
