/**
* | output |
* | --- |
* | "Edit {Ticket}" |
*
* @param {Ticket_Content_Edit_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_content_edit_title: ((inputs: Ticket_Content_Edit_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Content_Edit_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Content_Edit_TitleInputs = {
    Ticket: NonNullable<unknown>;
};
