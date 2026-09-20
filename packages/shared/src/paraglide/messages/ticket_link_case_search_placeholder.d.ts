/**
* | output |
* | --- |
* | "Search {tickets}..." |
*
* @param {Ticket_Link_Case_Search_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_link_case_search_placeholder: ((inputs: Ticket_Link_Case_Search_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Link_Case_Search_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Link_Case_Search_PlaceholderInputs = {
    tickets: NonNullable<unknown>;
};
