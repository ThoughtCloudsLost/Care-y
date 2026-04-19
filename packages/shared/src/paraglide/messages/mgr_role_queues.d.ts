/**
* | output |
* | --- |
* | "See all queues, not just your assignments" |
*
* @param {Mgr_Role_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_role_queues: ((inputs?: Mgr_Role_QueuesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Mgr_Role_QueuesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Mgr_Role_QueuesInputs = {};
