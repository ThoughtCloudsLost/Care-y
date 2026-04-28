/**
* | output |
* | --- |
* | "Back to search" |
*
* @param {Ticket_New_Back_To_SearchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_back_to_search: ((inputs?: Ticket_New_Back_To_SearchInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_New_Back_To_SearchInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_New_Back_To_SearchInputs = {};
