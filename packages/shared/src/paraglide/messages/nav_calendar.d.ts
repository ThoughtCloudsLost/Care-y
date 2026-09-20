/**
* | output |
* | --- |
* | "Calendar" |
*
* @param {Nav_CalendarInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const nav_calendar: ((inputs?: Nav_CalendarInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Nav_CalendarInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Nav_CalendarInputs = {};
