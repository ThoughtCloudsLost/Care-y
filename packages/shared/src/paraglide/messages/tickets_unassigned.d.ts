/**
* | output |
* | --- |
* | "Unassigned" |
*
* @param {Tickets_UnassignedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_unassigned: ((inputs?: Tickets_UnassignedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_UnassignedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_UnassignedInputs = {};
