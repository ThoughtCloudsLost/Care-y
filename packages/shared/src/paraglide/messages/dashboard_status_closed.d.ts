/**
* | output |
* | --- |
* | "Closed" |
*
* @param {Dashboard_Status_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_status_closed: ((inputs?: Dashboard_Status_ClosedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Status_ClosedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Status_ClosedInputs = {};
