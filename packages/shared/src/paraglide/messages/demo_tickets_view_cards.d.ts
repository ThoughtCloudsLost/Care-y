/**
* | output |
* | --- |
* | "Switching to card view" |
*
* @param {Demo_Tickets_View_CardsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_tickets_view_cards: ((inputs?: Demo_Tickets_View_CardsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Tickets_View_CardsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Tickets_View_CardsInputs = {};
