/**
* | output |
* | --- |
* | "All your notification preferences will revert to the defaults. This cannot be undone." |
*
* @param {Notif_Reset_All_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_reset_all_confirm: ((inputs?: Notif_Reset_All_ConfirmInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Reset_All_ConfirmInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Reset_All_ConfirmInputs = {};
