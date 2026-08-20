/**
* | output |
* | --- |
* | "New words" |
*
* @param {Ticket_Tier_New_WordsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_new_words: ((inputs?: Ticket_Tier_New_WordsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_New_WordsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_New_WordsInputs = {};
