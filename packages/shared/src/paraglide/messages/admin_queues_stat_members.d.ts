/**
* | output |
* | --- |
* | "{count} members" |
*
* @param {Admin_Queues_Stat_MembersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queues_stat_members: ((inputs: Admin_Queues_Stat_MembersInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queues_Stat_MembersInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queues_Stat_MembersInputs = {
    count: NonNullable<unknown>;
};
