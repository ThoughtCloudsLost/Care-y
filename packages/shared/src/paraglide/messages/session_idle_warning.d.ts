/**
* | output |
* | --- |
* | "Session will lock in 5 minutes due to inactivity" |
*
* @param {Session_Idle_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const session_idle_warning: ((inputs?: Session_Idle_WarningInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Session_Idle_WarningInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Session_Idle_WarningInputs = {};
