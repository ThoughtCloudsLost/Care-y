/**
* | output |
* | --- |
* | "On hold" |
*
* @param {Status_Mark_HoldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const status_mark_hold: ((inputs?: Status_Mark_HoldInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Status_Mark_HoldInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Status_Mark_HoldInputs = {};
