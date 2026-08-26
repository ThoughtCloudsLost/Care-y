/**
* | output |
* | --- |
* | "Both callers have a portal link" |
*
* @param {Merge_Channel_Choice_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const merge_channel_choice_heading: ((inputs?: Merge_Channel_Choice_HeadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Merge_Channel_Choice_HeadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Merge_Channel_Choice_HeadingInputs = {};
