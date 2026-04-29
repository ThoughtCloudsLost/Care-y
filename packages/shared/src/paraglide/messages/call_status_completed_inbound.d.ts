/**
* | output |
* | --- |
* | "Inbound call ({duration})" |
*
* @param {Call_Status_Completed_InboundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const call_status_completed_inbound: ((inputs: Call_Status_Completed_InboundInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Call_Status_Completed_InboundInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Call_Status_Completed_InboundInputs = {
    duration: NonNullable<unknown>;
};
