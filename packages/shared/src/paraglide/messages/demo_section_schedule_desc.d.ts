/**
* | output |
* | --- |
* | "The schedule page will manage volunteer shifts. The scheduling feature is still in development." |
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
