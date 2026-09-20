/**
* | output |
* | --- |
* | "Browse call and voicemail history across all {tickets}" |
*
* @param {Hub_Call_Log_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_call_log_subtitle: ((inputs: Hub_Call_Log_SubtitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Call_Log_SubtitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Call_Log_SubtitleInputs = {
    tickets: NonNullable<unknown>;
};
