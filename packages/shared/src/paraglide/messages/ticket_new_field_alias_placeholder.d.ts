/**
* | output |
* | --- |
* | "How you'll refer to this {client}" |
*
* @param {Ticket_New_Field_Alias_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_alias_placeholder: ((inputs: Ticket_New_Field_Alias_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_New_Field_Alias_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_New_Field_Alias_PlaceholderInputs = {
    client: NonNullable<unknown>;
};
