/**
* | output |
* | --- |
* | "Move" |
*
* @param {Library_Action_MoveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_action_move: ((inputs?: Library_Action_MoveInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Action_MoveInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Action_MoveInputs = {};
