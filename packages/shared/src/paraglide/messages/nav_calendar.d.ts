/**
* | output |
* | --- |
* | "Calendar" |
*
* @param {Nav_CalendarInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const nav_calendar: ((inputs?: Nav_CalendarInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Nav_CalendarInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Nav_CalendarInputs = {};
