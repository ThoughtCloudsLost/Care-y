/**
* | output |
* | --- |
* | "Inbound" |
*
* @param {Logs_Direction_InboundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_direction_inbound: ((inputs?: Logs_Direction_InboundInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Direction_InboundInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Direction_InboundInputs = {};
