/**
* | output |
* | --- |
* | "No active queues" |
*
* @param {Mgr_Ops_No_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_ops_no_queues: ((inputs?: Mgr_Ops_No_QueuesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Mgr_Ops_No_QueuesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Mgr_Ops_No_QueuesInputs = {};
