/**
* | output |
* | --- |
* | "{Clients} are created when {tickets} are opened." |
*
* @param {Clients_Empty_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const clients_empty_subtitle: ((inputs: Clients_Empty_SubtitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Clients_Empty_SubtitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Clients_Empty_SubtitleInputs = {
    Clients: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
    clients: NonNullable<unknown>;
};
