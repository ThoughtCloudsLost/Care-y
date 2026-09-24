/**
* | output |
* | --- |
* | "Communications" |
*
* @param {Panel_Group_CommunicationsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_group_communications: ((inputs?: Panel_Group_CommunicationsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_Group_CommunicationsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_Group_CommunicationsInputs = {};
