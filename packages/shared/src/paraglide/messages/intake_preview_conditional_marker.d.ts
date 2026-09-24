/**
* | output |
* | --- |
* | "Conditional page" |
*
* @param {Intake_Preview_Conditional_MarkerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_preview_conditional_marker: ((inputs?: Intake_Preview_Conditional_MarkerInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Preview_Conditional_MarkerInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Preview_Conditional_MarkerInputs = {};
