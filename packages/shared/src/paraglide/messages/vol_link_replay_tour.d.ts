/**
* | output |
* | --- |
* | "Replay App Tour" |
*
* @param {Vol_Link_Replay_TourInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_link_replay_tour: ((inputs?: Vol_Link_Replay_TourInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Vol_Link_Replay_TourInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Vol_Link_Replay_TourInputs = {};
