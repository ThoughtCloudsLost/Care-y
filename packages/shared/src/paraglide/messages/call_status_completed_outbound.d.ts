/**
* | output |
* | --- |
* | "Outbound call ({duration})" |
*
* @param {Call_Status_Completed_OutboundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const call_status_completed_outbound: ((inputs: Call_Status_Completed_OutboundInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Call_Status_Completed_OutboundInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Call_Status_Completed_OutboundInputs = {
    duration: NonNullable<unknown>;
};
