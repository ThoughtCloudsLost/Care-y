/**
* | output |
* | --- |
* | "Number unblocked" |
*
* @param {Admin_Blacklist_RemovedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blacklist_removed: ((inputs?: Admin_Blacklist_RemovedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Blacklist_RemovedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Blacklist_RemovedInputs = {};
