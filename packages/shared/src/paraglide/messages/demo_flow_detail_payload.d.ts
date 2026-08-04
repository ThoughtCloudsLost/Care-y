/**
* | output |
* | --- |
* | "Payload preview" |
*
* @param {Demo_Flow_Detail_PayloadInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_payload: ((inputs?: Demo_Flow_Detail_PayloadInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Detail_PayloadInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Detail_PayloadInputs = {};
