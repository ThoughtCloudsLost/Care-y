/**
* | output |
* | --- |
* | "This deletes the stored API key. Funds linked through this connection will show their raised total as unavailable until you link them again." |
*
* @param {Admin_Donations_Remove_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_remove_confirm: ((inputs?: Admin_Donations_Remove_ConfirmInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Donations_Remove_ConfirmInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Donations_Remove_ConfirmInputs = {};
