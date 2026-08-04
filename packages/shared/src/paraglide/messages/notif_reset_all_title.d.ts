/**
* | output |
* | --- |
* | "Reset notification preferences?" |
*
* @param {Notif_Reset_All_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_reset_all_title: ((inputs?: Notif_Reset_All_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Reset_All_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Reset_All_TitleInputs = {};
