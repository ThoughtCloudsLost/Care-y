/**
* | output |
* | --- |
* | "Title is required" |
*
* @param {Ticket_New_Error_Title_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_error_title_required: ((inputs?: Ticket_New_Error_Title_RequiredInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_New_Error_Title_RequiredInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_New_Error_Title_RequiredInputs = {};
