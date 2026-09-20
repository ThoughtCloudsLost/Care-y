/**
* | output |
* | --- |
* | "Cards" |
*
* @param {View_Switcher_CardsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const view_switcher_cards: ((inputs?: View_Switcher_CardsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<View_Switcher_CardsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type View_Switcher_CardsInputs = {};
