/**
* | output |
* | --- |
* | "{count} members" |
*
* @param {Admin_Queue_MembersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_members: ((inputs: Admin_Queue_MembersInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_MembersInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_MembersInputs = {
    count: NonNullable<unknown>;
};
