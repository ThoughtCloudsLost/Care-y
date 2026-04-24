/**
* | output |
* | --- |
* | "You ({name})" |
*
* @param {Ticket_Author_YouInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_author_you: ((inputs: Ticket_Author_YouInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Author_YouInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Author_YouInputs = {
    name: NonNullable<unknown>;
};
