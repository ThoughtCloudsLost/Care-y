/**
* | output |
* | --- |
* | "Outbound" |
*
* @param {Logs_Direction_OutboundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_direction_outbound: ((inputs?: Logs_Direction_OutboundInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Direction_OutboundInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Direction_OutboundInputs = {};
