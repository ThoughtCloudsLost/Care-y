/**
* | output |
* | --- |
* | "{count} / {max}" |
*
* @param {Portal_Composer_CounterInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_composer_counter: ((inputs: Portal_Composer_CounterInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Composer_CounterInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Composer_CounterInputs = {
    count: NonNullable<unknown>;
    max: NonNullable<unknown>;
};
