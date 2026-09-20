/**
* | output |
* | --- |
* | "{count} open tickets" |
*
* @param {Mgr_Ops_Total_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const mgr_ops_total_tickets: ((inputs: Mgr_Ops_Total_TicketsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Mgr_Ops_Total_TicketsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Mgr_Ops_Total_TicketsInputs = {
    count: NonNullable<unknown>;
};
