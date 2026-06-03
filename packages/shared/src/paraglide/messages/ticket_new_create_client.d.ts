/**
* | output |
* | --- |
* | "Create new {client}" |
*
* @param {Ticket_New_Create_ClientInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_create_client: ((inputs: Ticket_New_Create_ClientInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_New_Create_ClientInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_New_Create_ClientInputs = {
    client: NonNullable<unknown>;
};
