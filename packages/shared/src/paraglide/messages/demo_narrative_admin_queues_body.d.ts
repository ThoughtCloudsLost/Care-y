/**
* | output |
* | --- |
* | "Queues are governed by three independent permissions. The Manage queues permission controls creation, reordering and deletion. The Manage queue membership pe..." |
*
* @param {Demo_Narrative_Admin_Queues_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_queues_body: ((inputs?: Demo_Narrative_Admin_Queues_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Queues_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Queues_BodyInputs = {};
