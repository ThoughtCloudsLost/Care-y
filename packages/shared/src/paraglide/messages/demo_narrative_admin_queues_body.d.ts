/**
* | output |
* | --- |
* | "Queues control how tickets are organized and routed. Administrators create queues, assign volunteers to them, and configure sort order and appearance. **Encr..." |
*
* @param {Demo_Narrative_Admin_Queues_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_queues_body: ((inputs?: Demo_Narrative_Admin_Queues_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Queues_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Queues_BodyInputs = {};
