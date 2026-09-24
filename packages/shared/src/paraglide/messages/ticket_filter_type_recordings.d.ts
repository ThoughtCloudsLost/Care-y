/**
* | output |
* | --- |
* | "Voicemails" |
*
* @param {Ticket_Filter_Type_RecordingsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_recordings: ((inputs?: Ticket_Filter_Type_RecordingsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Filter_Type_RecordingsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Filter_Type_RecordingsInputs = {};
