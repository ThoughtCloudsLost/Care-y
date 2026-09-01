/**
* | output |
* | --- |
* | "Copy email address" |
*
* @param {Email_Copy_ClipboardInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const email_copy_clipboard: ((inputs?: Email_Copy_ClipboardInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Email_Copy_ClipboardInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Email_Copy_ClipboardInputs = {};
