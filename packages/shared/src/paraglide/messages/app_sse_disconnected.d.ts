/**
* | output |
* | --- |
* | "Real-time connection lost. Reconnecting..." |
*
* @param {App_Sse_DisconnectedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const app_sse_disconnected: ((inputs?: App_Sse_DisconnectedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<App_Sse_DisconnectedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type App_Sse_DisconnectedInputs = {};
