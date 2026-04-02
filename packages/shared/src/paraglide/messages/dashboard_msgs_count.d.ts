/**
* | output |
* | --- |
* | "{count} msgs" |
*
* @param {Dashboard_Msgs_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_msgs_count: ((inputs: Dashboard_Msgs_CountInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Msgs_CountInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Msgs_CountInputs = {
    count: NonNullable<unknown>;
};
