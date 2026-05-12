/**
* | output |
* | --- |
* | "Visible to other volunteers in your organization." |
*
* @param {Onboarding_Account_Display_Name_InfoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_display_name_info: ((inputs?: Onboarding_Account_Display_Name_InfoInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Account_Display_Name_InfoInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Account_Display_Name_InfoInputs = {};
