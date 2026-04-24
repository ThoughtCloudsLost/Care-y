/**
* | output |
* | --- |
* | "{current} of {total}" |
*
* @param {Search_Conversation_PositionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_conversation_position: ((inputs: Search_Conversation_PositionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Conversation_PositionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Conversation_PositionInputs = {
    current: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
