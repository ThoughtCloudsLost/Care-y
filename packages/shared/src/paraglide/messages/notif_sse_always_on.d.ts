/**
* | output |
* | --- |
* | "In-app alerts are always on." |
*
* @param {Notif_Sse_Always_OnInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_sse_always_on: ((inputs?: Notif_Sse_Always_OnInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Sse_Always_OnInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Sse_Always_OnInputs = {};
