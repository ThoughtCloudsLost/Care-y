/**
* | output |
* | --- |
* | "edited" |
*
* @param {Notif_Override_EditedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_override_edited: ((inputs?: Notif_Override_EditedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Override_EditedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Override_EditedInputs = {};
