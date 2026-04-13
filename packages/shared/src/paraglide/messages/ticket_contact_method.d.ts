/**
* | output |
* | --- |
* | "Contact" |
*
* @param {Ticket_Contact_MethodInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_contact_method: ((inputs?: Ticket_Contact_MethodInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Contact_MethodInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Contact_MethodInputs = {};
