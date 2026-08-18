/**
* | output |
* | --- |
* | "Start time" |
*
* @param {Intake_Avail_Start_TimeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_start_time: ((inputs?: Intake_Avail_Start_TimeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Avail_Start_TimeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Avail_Start_TimeInputs = {};
