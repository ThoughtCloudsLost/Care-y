/**
* | output |
* | --- |
* | "Select a ticket to view" |
*
* @param {Tickets_Select_PromptInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_select_prompt: ((inputs?: Tickets_Select_PromptInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Select_PromptInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Select_PromptInputs = {};
