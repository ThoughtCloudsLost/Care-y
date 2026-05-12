/**
* | output |
* | --- |
* | "Set up automated text message responses for incoming messages." |
*
* @param {Getting_Started_Sms_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_sms_desc: ((inputs?: Getting_Started_Sms_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_Sms_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_Sms_DescInputs = {};
