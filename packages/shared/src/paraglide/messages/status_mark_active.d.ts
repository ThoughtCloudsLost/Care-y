/**
* | output |
* | --- |
* | "Active" |
*
* @param {Status_Mark_ActiveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const status_mark_active: ((inputs?: Status_Mark_ActiveInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Status_Mark_ActiveInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Status_Mark_ActiveInputs = {};
