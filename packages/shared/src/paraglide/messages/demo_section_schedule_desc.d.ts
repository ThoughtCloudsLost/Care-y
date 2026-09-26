/**
* | output |
* | --- |
* | "The schedule page manages recurring shifts, coverage assignments, and a calendar that reads by day, week, or month. Shift times and coverage assignments are ..." |
*
* @param {Demo_Section_Schedule_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_schedule_desc: ((inputs?: Demo_Section_Schedule_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Schedule_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Schedule_DescInputs = {};
