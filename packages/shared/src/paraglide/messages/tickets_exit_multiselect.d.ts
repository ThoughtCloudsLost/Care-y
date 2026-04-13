/**
* | output |
* | --- |
* | "Exit selection mode" |
*
* @param {Tickets_Exit_MultiselectInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_exit_multiselect: ((inputs?: Tickets_Exit_MultiselectInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Exit_MultiselectInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Exit_MultiselectInputs = {};
