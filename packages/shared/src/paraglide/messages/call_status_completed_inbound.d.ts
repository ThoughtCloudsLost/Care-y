/**
* | output |
* | --- |
* | "Inbound call ({duration})" |
*
* @param {Call_Status_Completed_InboundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const call_status_completed_inbound: ((inputs: Call_Status_Completed_InboundInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Call_Status_Completed_InboundInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Call_Status_Completed_InboundInputs = {
    duration: NonNullable<unknown>;
};
