/**
* | output |
* | --- |
* | "Copied to clipboard" |
*
* @param {Ticket_Copied_To_ClipboardInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_copied_to_clipboard: ((inputs?: Ticket_Copied_To_ClipboardInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Copied_To_ClipboardInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Copied_To_ClipboardInputs = {};
