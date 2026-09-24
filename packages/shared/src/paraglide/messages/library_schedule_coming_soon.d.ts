/**
* | output |
* | --- |
* | "Schedule is coming soon." |
*
* @param {Library_Schedule_Coming_SoonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_schedule_coming_soon: ((inputs?: Library_Schedule_Coming_SoonInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Schedule_Coming_SoonInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Schedule_Coming_SoonInputs = {};
