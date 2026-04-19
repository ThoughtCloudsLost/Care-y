/**
* | output |
* | --- |
* | "Enter the full number without the country code." |
*
* @param {Admin_Blacklist_Phone_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blacklist_phone_hint: ((inputs?: Admin_Blacklist_Phone_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Blacklist_Phone_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Blacklist_Phone_HintInputs = {};
