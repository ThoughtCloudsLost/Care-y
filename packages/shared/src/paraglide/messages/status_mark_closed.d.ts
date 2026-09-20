/**
* | output |
* | --- |
* | "Closed" |
*
* @param {Status_Mark_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const status_mark_closed: ((inputs?: Status_Mark_ClosedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Status_Mark_ClosedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Status_Mark_ClosedInputs = {};
