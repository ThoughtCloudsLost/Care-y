/**
* | output |
* | --- |
* | "Pick a feature from the list and the simulator opens that screen. Tap around in the simulator and the story follows you. Nothing you type here leaves your de..." |
*
* @param {Demo_Entry_Nav_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_nav_body: ((inputs?: Demo_Entry_Nav_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Entry_Nav_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Entry_Nav_BodyInputs = {};
