/**
* | output |
* | --- |
* | "New" |
*
* @param {Status_Mark_NewInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const status_mark_new: ((inputs?: Status_Mark_NewInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Status_Mark_NewInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Status_Mark_NewInputs = {};
