/**
* | output |
* | --- |
* | "Email and text messages are delivered to an outbox inside the handbook. Nothing is sent to a real address or phone number." |
*
* @param {Demo_Flow_Seam_Outbox_DeliveryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_seam_outbox_delivery: ((inputs?: Demo_Flow_Seam_Outbox_DeliveryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Seam_Outbox_DeliveryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Seam_Outbox_DeliveryInputs = {};
