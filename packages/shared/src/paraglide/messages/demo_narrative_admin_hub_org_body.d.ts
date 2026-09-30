/**
* | output |
* | --- |
* | "The organization group collects the settings that apply to the whole workspace, not to any single ticket, from naming and branding to retention and key custo..." |
*
* @param {Demo_Narrative_Admin_Hub_Org_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_hub_org_body: ((inputs?: Demo_Narrative_Admin_Hub_Org_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Hub_Org_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Hub_Org_BodyInputs = {};
