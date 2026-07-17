/**
* | output |
* | --- |
* | "Viewed {tickets}" |
*
* @param {Search_Viewed_Tickets_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_viewed_tickets_heading: ((inputs: Search_Viewed_Tickets_HeadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Viewed_Tickets_HeadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Viewed_Tickets_HeadingInputs = {
    tickets: NonNullable<unknown>;
    Tickets: NonNullable<unknown>;
};
