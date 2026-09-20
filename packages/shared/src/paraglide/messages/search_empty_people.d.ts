/**
* | output |
* | --- |
* | "No teammates match \"{query}\"." |
*
* @param {Search_Empty_PeopleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_empty_people: ((inputs: Search_Empty_PeopleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Empty_PeopleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Empty_PeopleInputs = {
    query: NonNullable<unknown>;
};
