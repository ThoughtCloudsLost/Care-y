/**
* | output |
* | --- |
* | "Reset all to defaults" |
*
* @param {Notif_Reset_AllInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_reset_all: ((inputs?: Notif_Reset_AllInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Reset_AllInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Reset_AllInputs = {};
