/**
* | output |
* | --- |
* | "Reset" |
*
* @param {Notif_Reset_All_ActionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_reset_all_action: ((inputs?: Notif_Reset_All_ActionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Reset_All_ActionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Reset_All_ActionInputs = {};
