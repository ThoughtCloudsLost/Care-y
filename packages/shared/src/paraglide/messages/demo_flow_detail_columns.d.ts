/**
* | output |
* | --- |
* | "{count} columns" |
*
* @param {Demo_Flow_Detail_ColumnsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_columns: ((inputs: Demo_Flow_Detail_ColumnsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Detail_ColumnsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Detail_ColumnsInputs = {
    count: NonNullable<unknown>;
};
