/**
* | output |
* | --- |
* | "Volunteers" |
*
* @param {Search_Section_VolunteersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_section_volunteers: ((inputs?: Search_Section_VolunteersInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Section_VolunteersInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Section_VolunteersInputs = {};
