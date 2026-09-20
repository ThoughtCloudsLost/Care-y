/**
* | output |
* | --- |
* | "All caught up" |
*
* @param {Tickets_Unread_Zero_StampInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_unread_zero_stamp: ((inputs?: Tickets_Unread_Zero_StampInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Unread_Zero_StampInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Unread_Zero_StampInputs = {};
