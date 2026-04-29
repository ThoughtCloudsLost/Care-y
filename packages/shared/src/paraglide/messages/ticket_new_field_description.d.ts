/**
* | output |
* | --- |
* | "Description" |
*
* @param {Ticket_New_Field_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_description: ((inputs?: Ticket_New_Field_DescriptionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_New_Field_DescriptionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_New_Field_DescriptionInputs = {};
