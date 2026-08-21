/**
* | output |
* | --- |
* | "{count} rows affected" |
*
* @param {Demo_Flow_Detail_Rows_AffectedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_rows_affected: ((inputs: Demo_Flow_Detail_Rows_AffectedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Detail_Rows_AffectedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Detail_Rows_AffectedInputs = {
    count: NonNullable<unknown>;
};
