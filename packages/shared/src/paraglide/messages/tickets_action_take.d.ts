/**
* | output |
* | --- |
* | "Take" |
*
* @param {Tickets_Action_TakeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_action_take: ((inputs?: Tickets_Action_TakeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Action_TakeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Action_TakeInputs = {};
