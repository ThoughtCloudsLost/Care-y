/**
* | output |
* | --- |
* | "{count} open" |
*
* @param {Mgr_Ops_Queue_DepthInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_ops_queue_depth: ((inputs: Mgr_Ops_Queue_DepthInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Mgr_Ops_Queue_DepthInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Mgr_Ops_Queue_DepthInputs = {
    count: NonNullable<unknown>;
};
