/**
* | output |
* | --- |
* | "{count} records pending re-encryption." |
*
* @param {Admin_Keys_Reseal_PendingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_keys_reseal_pending: ((inputs: Admin_Keys_Reseal_PendingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Keys_Reseal_PendingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Keys_Reseal_PendingInputs = {
    count: NonNullable<unknown>;
};
