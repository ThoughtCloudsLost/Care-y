/**
* | output |
* | --- |
* | "{count} rows returned" |
*
* @param {Demo_Flow_Detail_Rows_ReturnedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_rows_returned: ((inputs: Demo_Flow_Detail_Rows_ReturnedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Detail_Rows_ReturnedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Detail_Rows_ReturnedInputs = {
    count: NonNullable<unknown>;
};
