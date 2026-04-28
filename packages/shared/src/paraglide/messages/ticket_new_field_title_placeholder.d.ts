/**
* | output |
* | --- |
* | "Brief description of the issue" |
*
* @param {Ticket_New_Field_Title_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_title_placeholder: ((inputs?: Ticket_New_Field_Title_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_New_Field_Title_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_New_Field_Title_PlaceholderInputs = {};
