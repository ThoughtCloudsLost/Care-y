/**
* | output |
* | --- |
* | "Reply" |
*
* @param {Tickets_Action_ReplyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_action_reply: ((inputs?: Tickets_Action_ReplyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Action_ReplyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Action_ReplyInputs = {};
