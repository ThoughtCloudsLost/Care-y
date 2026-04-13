/**
* | output |
* | --- |
* | "Expand {summary}" |
*
* @param {Ticket_Timeline_Expand_ClusterInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_expand_cluster: ((inputs: Ticket_Timeline_Expand_ClusterInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Timeline_Expand_ClusterInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Timeline_Expand_ClusterInputs = {
    summary: NonNullable<unknown>;
};
