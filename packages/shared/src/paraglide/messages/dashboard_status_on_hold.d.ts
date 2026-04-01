/**
* | output |
* | --- |
* | "On Hold" |
*
* @param {Dashboard_Status_On_HoldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_status_on_hold: ((inputs?: Dashboard_Status_On_HoldInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Status_On_HoldInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Status_On_HoldInputs = {};
