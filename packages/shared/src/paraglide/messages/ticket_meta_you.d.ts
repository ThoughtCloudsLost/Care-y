/**
* | output |
* | --- |
* | "you" |
*
* @param {Ticket_Meta_YouInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_meta_you: ((inputs?: Ticket_Meta_YouInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Meta_YouInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Meta_YouInputs = {};
