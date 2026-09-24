/**
* | output |
* | --- |
* | "Open full view" |
*
* @param {Tickets_Detail_ExpandInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_detail_expand: ((inputs?: Tickets_Detail_ExpandInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Detail_ExpandInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Detail_ExpandInputs = {};
