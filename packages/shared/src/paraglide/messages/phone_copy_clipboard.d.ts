/**
* | output |
* | --- |
* | "Copy phone number" |
*
* @param {Phone_Copy_ClipboardInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const phone_copy_clipboard: ((inputs?: Phone_Copy_ClipboardInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Phone_Copy_ClipboardInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Phone_Copy_ClipboardInputs = {};
