/**
* | output |
* | --- |
* | "Search timezones..." |
*
* @param {Intake_Avail_Timezone_SearchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_avail_timezone_search: ((inputs?: Intake_Avail_Timezone_SearchInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Avail_Timezone_SearchInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Avail_Timezone_SearchInputs = {};
