/**
* | output |
* | --- |
* | "Search timezones..." |
*
* @param {Intake_Avail_Timezone_SearchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_timezone_search: ((inputs?: Intake_Avail_Timezone_SearchInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Avail_Timezone_SearchInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Avail_Timezone_SearchInputs = {};
