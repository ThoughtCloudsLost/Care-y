/**
* | output |
* | --- |
* | "{count} methods enrolled" |
*
* @param {Settings_2fa_MethodsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_2fa_methods: ((inputs: Settings_2fa_MethodsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_2fa_MethodsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_2fa_MethodsInputs = {
    count: NonNullable<unknown>;
};
