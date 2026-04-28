/**
* | output |
* | --- |
* | "Alias (optional)" |
*
* @param {Ticket_New_Field_AliasInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_alias: ((inputs?: Ticket_New_Field_AliasInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_New_Field_AliasInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_New_Field_AliasInputs = {};
