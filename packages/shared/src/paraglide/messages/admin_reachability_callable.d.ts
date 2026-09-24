/**
* | output |
* | --- |
* | "Callable" |
*
* @param {Admin_Reachability_CallableInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reachability_callable: ((inputs?: Admin_Reachability_CallableInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Reachability_CallableInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Reachability_CallableInputs = {};
