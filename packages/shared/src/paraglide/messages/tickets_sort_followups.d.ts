/**
* | output |
* | --- |
* | "Most follow-ups" |
*
* @param {Tickets_Sort_FollowupsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_followups: ((inputs?: Tickets_Sort_FollowupsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Sort_FollowupsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Sort_FollowupsInputs = {};
