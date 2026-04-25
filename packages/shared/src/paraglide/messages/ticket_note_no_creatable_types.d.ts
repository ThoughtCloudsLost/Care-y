/**
* | output |
* | --- |
* | "Your role does not have permission to create any note types." |
*
* @param {Ticket_Note_No_Creatable_TypesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_note_no_creatable_types: ((inputs?: Ticket_Note_No_Creatable_TypesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Note_No_Creatable_TypesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Note_No_Creatable_TypesInputs = {};
