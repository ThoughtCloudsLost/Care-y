/**
* | output |
* | --- |
* | "Copy phone number" |
*
* @param {Phone_Copy_ClipboardInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const phone_copy_clipboard: ((inputs?: Phone_Copy_ClipboardInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Phone_Copy_ClipboardInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Phone_Copy_ClipboardInputs = {};
