/**
* | output |
* | --- |
* | "Assign" |
*
* @param {Tickets_Action_AssignInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_action_assign: ((inputs?: Tickets_Action_AssignInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Action_AssignInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Action_AssignInputs = {};
