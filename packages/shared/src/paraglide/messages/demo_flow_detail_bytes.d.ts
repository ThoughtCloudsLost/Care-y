/**
* | output |
* | --- |
* | "{count} bytes" |
*
* @param {Demo_Flow_Detail_BytesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_bytes: ((inputs: Demo_Flow_Detail_BytesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Detail_BytesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Detail_BytesInputs = {
    count: NonNullable<unknown>;
};
