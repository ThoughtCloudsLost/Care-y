/**
* | output |
* | --- |
* | "External channel configuration: telephony provider, voicemail greetings, SMS templates, the number blocklist, and the voicemail quarantine. These settings co..." |
*
* @param {Demo_Narrative_Admin_Hub_Comms_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_hub_comms_body: ((inputs?: Demo_Narrative_Admin_Hub_Comms_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Hub_Comms_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Hub_Comms_BodyInputs = {};
