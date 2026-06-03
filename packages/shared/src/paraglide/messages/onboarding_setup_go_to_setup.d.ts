/**
* | output |
* | --- |
* | "Go to setup" |
*
* @param {Onboarding_Setup_Go_To_SetupInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_setup_go_to_setup: ((inputs?: Onboarding_Setup_Go_To_SetupInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Setup_Go_To_SetupInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Setup_Go_To_SetupInputs = {};
