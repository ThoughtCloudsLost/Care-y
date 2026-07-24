/**
* | output |
* | --- |
* | "unread" |
*
* @param {Tickets_Count_New_Replies_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_count_new_replies_one: ((inputs?: Tickets_Count_New_Replies_OneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Count_New_Replies_OneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Count_New_Replies_OneInputs = {};
