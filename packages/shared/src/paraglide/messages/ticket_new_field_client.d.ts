/**
* | output |
* | --- |
* | "{Client}" |
*
* @param {Ticket_New_Field_ClientInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_client: ((inputs: Ticket_New_Field_ClientInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_New_Field_ClientInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_New_Field_ClientInputs = {
    Client: NonNullable<unknown>;
};
