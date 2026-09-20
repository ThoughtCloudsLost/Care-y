/**
* | output |
* | --- |
* | "Reorder" |
*
* @param {Admin_Queues_Select_ModeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queues_select_mode: ((inputs?: Admin_Queues_Select_ModeInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queues_Select_ModeInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queues_Select_ModeInputs = {};
