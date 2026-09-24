/**
* | output |
* | --- |
* | "Exit selection mode" |
*
* @param {Tickets_Exit_MultiselectInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_exit_multiselect: ((inputs?: Tickets_Exit_MultiselectInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Exit_MultiselectInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Exit_MultiselectInputs = {};
