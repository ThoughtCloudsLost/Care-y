/**
* | output |
* | --- |
* | "The drawer opens from the identity button on every client page. It shows the organization's name and logo. The header identifies the organization, not the pe..." |
*
* @param {Demo_Narrative_Client_Drawer_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_drawer_body: ((inputs?: Demo_Narrative_Client_Drawer_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Drawer_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Drawer_BodyInputs = {};
