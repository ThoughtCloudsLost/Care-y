/**
* | output |
* | --- |
* | "Schedule" |
*
* @param {Demo_Section_Schedule_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_schedule_title: ((inputs?: Demo_Section_Schedule_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Schedule_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Schedule_TitleInputs = {};
