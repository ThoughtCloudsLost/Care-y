/**
* | output |
* | --- |
* | "Account" |
*
* @param {Merge_Channel_Kind_AccountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const merge_channel_kind_account: ((inputs?: Merge_Channel_Kind_AccountInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Merge_Channel_Kind_AccountInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Merge_Channel_Kind_AccountInputs = {};
