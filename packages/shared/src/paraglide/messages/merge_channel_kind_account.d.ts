/**
* | output |
* | --- |
* | "Account" |
*
* @param {Merge_Channel_Kind_AccountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const merge_channel_kind_account: ((inputs?: Merge_Channel_Kind_AccountInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Merge_Channel_Kind_AccountInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Merge_Channel_Kind_AccountInputs = {};
