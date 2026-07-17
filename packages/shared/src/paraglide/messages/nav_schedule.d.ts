/**
* | output |
* | --- |
* | "Schedule" |
*
* @param {Nav_ScheduleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const nav_schedule: ((inputs?: Nav_ScheduleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Nav_ScheduleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Nav_ScheduleInputs = {};
