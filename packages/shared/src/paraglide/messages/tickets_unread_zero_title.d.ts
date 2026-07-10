/**
* | output |
* | --- |
* | "You've read every new reply" |
*
* @param {Tickets_Unread_Zero_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_unread_zero_title: ((inputs?: Tickets_Unread_Zero_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Unread_Zero_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Unread_Zero_TitleInputs = {};
