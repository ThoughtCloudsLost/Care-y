/**
* | output |
* | --- |
* | "new replies" |
*
* @param {Tickets_Count_New_Replies_OtherInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_count_new_replies_other: ((inputs?: Tickets_Count_New_Replies_OtherInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Count_New_Replies_OtherInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Count_New_Replies_OtherInputs = {};
