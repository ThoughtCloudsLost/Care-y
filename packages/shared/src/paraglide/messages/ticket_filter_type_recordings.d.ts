/**
* | output |
* | --- |
* | "Voicemails" |
*
* @param {Ticket_Filter_Type_RecordingsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_recordings: ((inputs?: Ticket_Filter_Type_RecordingsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Filter_Type_RecordingsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Filter_Type_RecordingsInputs = {};
