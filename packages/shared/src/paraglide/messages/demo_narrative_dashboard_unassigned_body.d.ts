/**
* | output |
* | --- |
* | "Open tickets that have not been assigned to any volunteer. These are waiting to be picked up. **Claiming a ticket.** Volunteers can assign an unassigned tick..." |
*
* @param {Demo_Narrative_Dashboard_Unassigned_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_unassigned_body: ((inputs?: Demo_Narrative_Dashboard_Unassigned_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_Unassigned_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_Unassigned_BodyInputs = {};
