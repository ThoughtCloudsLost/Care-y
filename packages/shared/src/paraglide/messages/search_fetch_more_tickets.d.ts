/**
* | output |
* | --- |
* | "Search the other {count} {tickets}" |
*
* @param {Search_Fetch_More_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_fetch_more_tickets: ((inputs: Search_Fetch_More_TicketsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Fetch_More_TicketsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Fetch_More_TicketsInputs = {
    count: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
};
