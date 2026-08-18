/**
* | output |
* | --- |
* | "End time" |
*
* @param {Intake_Avail_End_TimeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_end_time: ((inputs?: Intake_Avail_End_TimeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Avail_End_TimeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Avail_End_TimeInputs = {};
