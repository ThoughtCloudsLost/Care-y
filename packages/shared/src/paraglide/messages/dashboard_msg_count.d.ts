/**
* | output |
* | --- |
* | "{count} msg" |
*
* @param {Dashboard_Msg_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_msg_count: ((inputs: Dashboard_Msg_CountInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Msg_CountInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Msg_CountInputs = {
    count: NonNullable<unknown>;
};
