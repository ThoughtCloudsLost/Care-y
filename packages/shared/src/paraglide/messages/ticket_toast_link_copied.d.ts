/**
* | output |
* | --- |
* | "Link copied" |
*
* @param {Ticket_Toast_Link_CopiedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_link_copied: ((inputs?: Ticket_Toast_Link_CopiedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Toast_Link_CopiedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Toast_Link_CopiedInputs = {};
