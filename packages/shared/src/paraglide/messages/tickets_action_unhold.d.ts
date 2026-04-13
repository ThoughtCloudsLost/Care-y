/**
* | output |
* | --- |
* | "Unhold" |
*
* @param {Tickets_Action_UnholdInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_action_unhold: ((inputs?: Tickets_Action_UnholdInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Action_UnholdInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Action_UnholdInputs = {};
