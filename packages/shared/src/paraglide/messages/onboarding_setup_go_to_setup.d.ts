/**
* | output |
* | --- |
* | "Go to setup" |
*
* @param {Onboarding_Setup_Go_To_SetupInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_setup_go_to_setup: ((inputs?: Onboarding_Setup_Go_To_SetupInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Setup_Go_To_SetupInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Setup_Go_To_SetupInputs = {};
