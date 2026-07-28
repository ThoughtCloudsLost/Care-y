/**
* | output |
* | --- |
* | "The roster shows every volunteer in the organization with their role and assigned queues. Administrators can add or remove volunteers and reconfigure queue a..." |
*
* @param {Demo_Narrative_Admin_People_Queues_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_people_queues_body: ((inputs?: Demo_Narrative_Admin_People_Queues_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_People_Queues_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_People_Queues_BodyInputs = {};
