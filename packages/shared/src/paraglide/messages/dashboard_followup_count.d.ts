/**
* | output |
* | --- |
* | "{count} follow-ups" |
*
* @param {Dashboard_Followup_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_followup_count: ((inputs: Dashboard_Followup_CountInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Followup_CountInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Followup_CountInputs = {
    count: NonNullable<unknown>;
};
