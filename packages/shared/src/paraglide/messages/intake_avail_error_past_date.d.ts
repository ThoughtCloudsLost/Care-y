/**
* | output |
* | --- |
* | "Date cannot be in the past." |
*
* @param {Intake_Avail_Error_Past_DateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_error_past_date: ((inputs?: Intake_Avail_Error_Past_DateInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Avail_Error_Past_DateInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Avail_Error_Past_DateInputs = {};
