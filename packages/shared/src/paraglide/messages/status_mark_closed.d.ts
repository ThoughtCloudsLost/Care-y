/**
* | output |
* | --- |
* | "Closed" |
*
* @param {Status_Mark_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const status_mark_closed: ((inputs?: Status_Mark_ClosedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Status_Mark_ClosedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Status_Mark_ClosedInputs = {};
