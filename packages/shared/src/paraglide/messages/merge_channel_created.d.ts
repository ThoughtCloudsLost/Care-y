/**
* | output |
* | --- |
* | "Created {date}" |
*
* @param {Merge_Channel_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const merge_channel_created: ((inputs: Merge_Channel_CreatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Merge_Channel_CreatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Merge_Channel_CreatedInputs = {
    date: NonNullable<unknown>;
};
