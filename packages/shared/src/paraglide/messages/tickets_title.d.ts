/**
* | output |
* | --- |
* | "{Tickets}" |
*
* @param {Tickets_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_title: ((inputs: Tickets_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_TitleInputs = {
    Tickets: NonNullable<unknown>;
};
