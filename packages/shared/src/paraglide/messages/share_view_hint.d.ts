/**
* | output |
* | --- |
* | "The link you opened carried the key that unlocked this message on your device. The server cannot read it. Because the key travels in the link, the link only ..." |
*
* @param {Share_View_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_view_hint: ((inputs?: Share_View_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_View_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_View_HintInputs = {};
