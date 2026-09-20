/**
* | output |
* | --- |
* | "{count} bytes" |
*
* @param {Demo_Flow_Detail_BytesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_bytes: ((inputs: Demo_Flow_Detail_BytesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Detail_BytesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Detail_BytesInputs = {
    count: NonNullable<unknown>;
};
