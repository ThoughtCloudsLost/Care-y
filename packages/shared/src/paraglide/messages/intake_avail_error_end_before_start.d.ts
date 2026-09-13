/**
* | output |
* | --- |
* | "End time must be after start time." |
*
* @param {Intake_Avail_Error_End_Before_StartInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_error_end_before_start: ((inputs?: Intake_Avail_Error_End_Before_StartInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Avail_Error_End_Before_StartInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Avail_Error_End_Before_StartInputs = {};
