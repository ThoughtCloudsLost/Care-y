/**
* | output |
* | --- |
* | "Description" |
*
* @param {Ticket_New_Field_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_description: ((inputs?: Ticket_New_Field_DescriptionInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_New_Field_DescriptionInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_New_Field_DescriptionInputs = {};
