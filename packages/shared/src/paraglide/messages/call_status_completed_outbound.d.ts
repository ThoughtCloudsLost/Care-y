/**
* | output |
* | --- |
* | "Outbound call ({duration})" |
*
* @param {Call_Status_Completed_OutboundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const call_status_completed_outbound: ((inputs: Call_Status_Completed_OutboundInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Call_Status_Completed_OutboundInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Call_Status_Completed_OutboundInputs = {
    duration: NonNullable<unknown>;
};
