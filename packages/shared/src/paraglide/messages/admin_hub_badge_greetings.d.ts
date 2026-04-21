/**
* | output |
* | --- |
* | "{count} greetings" |
*
* @param {Admin_Hub_Badge_GreetingsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_greetings: ((inputs: Admin_Hub_Badge_GreetingsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Hub_Badge_GreetingsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Hub_Badge_GreetingsInputs = {
    count: NonNullable<unknown>;
};
