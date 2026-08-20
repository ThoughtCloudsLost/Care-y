/**
* | output |
* | --- |
* | "Compose actions" |
*
* @param {Demo_Topic_Compose_ActionsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_compose_actions: ((inputs?: Demo_Topic_Compose_ActionsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Topic_Compose_ActionsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Topic_Compose_ActionsInputs = {};
