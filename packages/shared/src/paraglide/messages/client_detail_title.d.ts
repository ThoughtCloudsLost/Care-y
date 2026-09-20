/**
* | output |
* | --- |
* | "{Client} Detail" |
*
* @param {Client_Detail_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_detail_title: ((inputs: Client_Detail_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Detail_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Detail_TitleInputs = {
    Client: NonNullable<unknown>;
};
