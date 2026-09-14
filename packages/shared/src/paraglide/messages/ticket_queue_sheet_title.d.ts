/**
* | output |
* | --- |
* | "Change {queue}" |
*
* @param {Ticket_Queue_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_queue_sheet_title: ((inputs: Ticket_Queue_Sheet_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Queue_Sheet_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Queue_Sheet_TitleInputs = {
    queue: NonNullable<unknown>;
};
