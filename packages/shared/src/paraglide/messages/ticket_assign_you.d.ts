/**
* | output |
* | --- |
* | "(you)" |
*
* @param {Ticket_Assign_YouInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_assign_you: ((inputs?: Ticket_Assign_YouInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Assign_YouInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Assign_YouInputs = {};
