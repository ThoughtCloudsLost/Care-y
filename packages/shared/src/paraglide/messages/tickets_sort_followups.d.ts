/**
* | output |
* | --- |
* | "Most follow-ups" |
*
* @param {Tickets_Sort_FollowupsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_followups: ((inputs?: Tickets_Sort_FollowupsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Sort_FollowupsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Sort_FollowupsInputs = {};
