/**
* | output |
* | --- |
* | "{shown} of {total}" |
*
* @param {Dashboard_Section_Count_OfInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_section_count_of: ((inputs: Dashboard_Section_Count_OfInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Section_Count_OfInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Section_Count_OfInputs = {
    shown: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
