/**
* | output |
* | --- |
* | "to" |
*
* @param {Intake_Avail_Time_ToInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_avail_time_to: ((inputs?: Intake_Avail_Time_ToInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Avail_Time_ToInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Avail_Time_ToInputs = {};
