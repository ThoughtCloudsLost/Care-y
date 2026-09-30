/**
* | output |
* | --- |
* | "My tickets lists open tickets assigned to the signed-in user. A ticket on hold does not appear until the hold is lifted. The heading count follows the lane's..." |
*
* @param {Demo_Narrative_Dashboard_My_Tickets_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_my_tickets_body: ((inputs?: Demo_Narrative_Dashboard_My_Tickets_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_My_Tickets_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_My_Tickets_BodyInputs = {};
