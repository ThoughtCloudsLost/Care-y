/**
* | output |
* | --- |
* | "{count} msg" |
*
* @param {Dashboard_Msg_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_msg_count: ((inputs: Dashboard_Msg_CountInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Msg_CountInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Msg_CountInputs = {
    count: NonNullable<unknown>;
};
