/**
* | output |
* | --- |
* | "The communications group configures how the organization reaches a client and how an inbound message is routed, across six destinations behind five different..." |
*
* @param {Demo_Narrative_Admin_Hub_Comms_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_hub_comms_body: ((inputs?: Demo_Narrative_Admin_Hub_Comms_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Hub_Comms_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Hub_Comms_BodyInputs = {};
