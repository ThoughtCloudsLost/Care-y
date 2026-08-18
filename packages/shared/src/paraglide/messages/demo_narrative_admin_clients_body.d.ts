/**
* | output |
* | --- |
* | "The client list shows all clients who have contacted the organization. Client records link to their associated tickets. **Encryption.** Client identifiers ar..." |
*
* @param {Demo_Narrative_Admin_Clients_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_clients_body: ((inputs?: Demo_Narrative_Admin_Clients_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Clients_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Clients_BodyInputs = {};
