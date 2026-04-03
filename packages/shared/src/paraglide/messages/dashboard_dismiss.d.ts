/**
* | output |
* | --- |
* | "OK" |
*
* @param {Dashboard_DismissInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_dismiss: ((inputs?: Dashboard_DismissInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_DismissInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_DismissInputs = {};
