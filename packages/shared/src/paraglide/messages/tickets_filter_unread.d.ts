/**
* | output |
* | --- |
* | "Unread" |
*
* @param {Tickets_Filter_UnreadInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_unread: ((inputs?: Tickets_Filter_UnreadInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Filter_UnreadInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Filter_UnreadInputs = {};
