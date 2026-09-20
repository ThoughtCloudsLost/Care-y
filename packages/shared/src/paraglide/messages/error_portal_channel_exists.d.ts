/**
* | output |
* | --- |
* | "This {client} already has an active secure link." |
*
* @param {Error_Portal_Channel_ExistsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_portal_channel_exists: ((inputs: Error_Portal_Channel_ExistsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Portal_Channel_ExistsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Portal_Channel_ExistsInputs = {
    client: NonNullable<unknown>;
};
