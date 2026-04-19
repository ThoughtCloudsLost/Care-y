/**
* | output |
* | --- |
* | "Your phone provider keeps its own logs of calls and messages for up to 30 days. CARE-Y requests deletion after processing, but the provider may retain them d..." |
*
* @param {Admin_Telephony_Data_Retention_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_data_retention_body: ((inputs?: Admin_Telephony_Data_Retention_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Data_Retention_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Data_Retention_BodyInputs = {};
