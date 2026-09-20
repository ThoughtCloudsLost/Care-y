/**
* | output |
* | --- |
* | "Review security walkthrough" |
*
* @param {Settings_Replay_WalkthroughInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_replay_walkthrough: ((inputs?: Settings_Replay_WalkthroughInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Replay_WalkthroughInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Replay_WalkthroughInputs = {};
