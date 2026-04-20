/**
* | output |
* | --- |
* | "Enter the full number without the country code." |
*
* @param {Admin_Blocklist_Phone_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_phone_hint: ((inputs?: Admin_Blocklist_Phone_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Blocklist_Phone_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Blocklist_Phone_HintInputs = {};
