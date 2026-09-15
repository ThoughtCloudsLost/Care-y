/**
* | output |
* | --- |
* | "Queues control how tickets are organized and routed. Creating queues, assigning users to them, and configuring their sort order and appearance all happen fro..." |
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
