/**
* | output |
* | --- |
* | "unread" |
*
* @param {Tickets_Count_New_Replies_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_count_new_replies_one: ((inputs?: Tickets_Count_New_Replies_OneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Count_New_Replies_OneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Count_New_Replies_OneInputs = {};
