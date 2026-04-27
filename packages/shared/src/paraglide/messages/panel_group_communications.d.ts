/**
* | output |
* | --- |
* | "Communications" |
*
* @param {Panel_Group_CommunicationsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_group_communications: ((inputs?: Panel_Group_CommunicationsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_Group_CommunicationsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_Group_CommunicationsInputs = {};
