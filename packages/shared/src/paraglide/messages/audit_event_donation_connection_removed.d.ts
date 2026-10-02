/**
* | output |
* | --- |
* | "Donation provider disconnected" |
*
* @param {Audit_Event_Donation_Connection_RemovedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_donation_connection_removed: ((inputs?: Audit_Event_Donation_Connection_RemovedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Donation_Connection_RemovedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Donation_Connection_RemovedInputs = {};
