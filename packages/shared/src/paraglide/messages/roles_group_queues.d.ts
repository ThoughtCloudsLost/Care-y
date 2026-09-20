/**
* | output |
* | --- |
* | "Queues" |
*
* @param {Roles_Group_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const roles_group_queues: ((inputs?: Roles_Group_QueuesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Group_QueuesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Group_QueuesInputs = {};
