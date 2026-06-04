/**
* | output |
* | --- |
* | "Close detail" |
*
* @param {Tickets_Detail_CloseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_detail_close: ((inputs?: Tickets_Detail_CloseInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Detail_CloseInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Detail_CloseInputs = {};
