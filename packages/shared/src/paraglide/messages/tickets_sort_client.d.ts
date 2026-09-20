/**
* | output |
* | --- |
* | "Client alias" |
*
* @param {Tickets_Sort_ClientInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_client: ((inputs?: Tickets_Sort_ClientInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Sort_ClientInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Sort_ClientInputs = {};
