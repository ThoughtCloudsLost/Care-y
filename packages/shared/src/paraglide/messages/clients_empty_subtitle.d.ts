/**
* | output |
* | --- |
* | "{Clients} are created when {tickets} are opened." |
*
* @param {Clients_Empty_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_empty_subtitle: ((inputs: Clients_Empty_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Clients_Empty_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Clients_Empty_SubtitleInputs = {
    Clients: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
    clients: NonNullable<unknown>;
};
