/**
* | output |
* | --- |
* | "Outbound" |
*
* @param {Logs_Direction_OutboundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_direction_outbound: ((inputs?: Logs_Direction_OutboundInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Direction_OutboundInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Direction_OutboundInputs = {};
