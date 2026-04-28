/**
* | output |
* | --- |
* | "+1 (555) 123-4567" |
*
* @param {Ticket_New_Field_Phone_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_phone_placeholder: ((inputs?: Ticket_New_Field_Phone_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_New_Field_Phone_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_New_Field_Phone_PlaceholderInputs = {};
