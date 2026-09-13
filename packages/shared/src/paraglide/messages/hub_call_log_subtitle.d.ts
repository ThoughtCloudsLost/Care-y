/**
* | output |
* | --- |
* | "Browse call and voicemail history across all {tickets}" |
*
* @param {Hub_Call_Log_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_call_log_subtitle: ((inputs: Hub_Call_Log_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Call_Log_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Call_Log_SubtitleInputs = {
    tickets: NonNullable<unknown>;
};
