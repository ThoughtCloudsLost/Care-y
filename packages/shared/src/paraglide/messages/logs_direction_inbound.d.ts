/**
* | output |
* | --- |
* | "Inbound" |
*
* @param {Logs_Direction_InboundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_direction_inbound: ((inputs?: Logs_Direction_InboundInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Direction_InboundInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Direction_InboundInputs = {};
