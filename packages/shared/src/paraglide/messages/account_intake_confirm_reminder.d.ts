/**
* | output |
* | --- |
* | "Your username is {username}. Sign in any time at /account on this site. Your password is never shown or sent anywhere." |
*
* @param {Account_Intake_Confirm_ReminderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_intake_confirm_reminder: ((inputs: Account_Intake_Confirm_ReminderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Intake_Confirm_ReminderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Intake_Confirm_ReminderInputs = {
    username: NonNullable<unknown>;
};
