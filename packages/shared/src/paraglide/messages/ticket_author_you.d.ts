/**
* | output |
* | --- |
* | "You ({name})" |
*
* @param {Ticket_Author_YouInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_author_you: ((inputs: Ticket_Author_YouInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Author_YouInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Author_YouInputs = {
    name: NonNullable<unknown>;
};
