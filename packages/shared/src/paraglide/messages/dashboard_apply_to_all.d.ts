/**
* | output |
* | --- |
* | "Apply to all" |
*
* @param {Dashboard_Apply_To_AllInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_apply_to_all: ((inputs?: Dashboard_Apply_To_AllInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Apply_To_AllInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Apply_To_AllInputs = {};
