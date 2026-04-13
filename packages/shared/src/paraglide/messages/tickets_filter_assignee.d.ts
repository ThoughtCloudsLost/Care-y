/**
* | output |
* | --- |
* | "Assignee" |
*
* @param {Tickets_Filter_AssigneeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_assignee: ((inputs?: Tickets_Filter_AssigneeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Filter_AssigneeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Filter_AssigneeInputs = {};
