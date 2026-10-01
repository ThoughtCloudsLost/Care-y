/**
* | output |
* | --- |
* | "Fund entries" |
*
* @param {Notif_Event_Fund_Entry_RecordedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_event_fund_entry_recorded: ((inputs?: Notif_Event_Fund_Entry_RecordedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Event_Fund_Entry_RecordedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Event_Fund_Entry_RecordedInputs = {};
