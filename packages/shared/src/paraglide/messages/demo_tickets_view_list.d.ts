/**
* | output |
* | --- |
* | "Switching to list view" |
*
* @param {Demo_Tickets_View_ListInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_tickets_view_list: ((inputs?: Demo_Tickets_View_ListInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Tickets_View_ListInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Tickets_View_ListInputs = {};
