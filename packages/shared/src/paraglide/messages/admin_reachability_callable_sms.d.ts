/**
* | output |
* | --- |
* | "Callable + SMS" |
*
* @param {Admin_Reachability_Callable_SmsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reachability_callable_sms: ((inputs?: Admin_Reachability_Callable_SmsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Reachability_Callable_SmsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Reachability_Callable_SmsInputs = {};
