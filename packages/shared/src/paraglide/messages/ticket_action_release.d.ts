/**
* | output |
* | --- |
* | "Release" |
*
* @param {Ticket_Action_ReleaseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_release: ((inputs?: Ticket_Action_ReleaseInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Action_ReleaseInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Action_ReleaseInputs = {};
