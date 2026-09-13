/**
* | output |
* | --- |
* | "Actor" |
*
* @param {Logs_Filter_ActorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_filter_actor: ((inputs?: Logs_Filter_ActorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Filter_ActorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Filter_ActorInputs = {};
