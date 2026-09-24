/**
* | output |
* | --- |
* | "Both callers have a portal link" |
*
* @param {Merge_Channel_Choice_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const merge_channel_choice_heading: ((inputs?: Merge_Channel_Choice_HeadingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Merge_Channel_Choice_HeadingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Merge_Channel_Choice_HeadingInputs = {};
