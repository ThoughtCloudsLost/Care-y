/**
* | output |
* | --- |
* | "Shift scheduling is in development and the schedule page carries a placeholder instead of a calendar, so this section describes the shape the feature is plan..." |
*
* @param {Demo_Section_Schedule_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_schedule_desc: ((inputs?: Demo_Section_Schedule_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Schedule_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Schedule_DescInputs = {};
