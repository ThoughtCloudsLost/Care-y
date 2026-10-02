/**
* | output |
* | --- |
* | "Donation provider connected" |
*
* @param {Audit_Event_Donation_Connection_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_donation_connection_saved: ((inputs?: Audit_Event_Donation_Connection_SavedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Donation_Connection_SavedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Donation_Connection_SavedInputs = {};
