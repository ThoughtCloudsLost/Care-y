/**
* | output |
* | --- |
* | "{permission} for {role}, locked to Admin" |
*
* @param {Roles_Locked_Toggle_AriaInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_locked_toggle_aria: ((inputs: Roles_Locked_Toggle_AriaInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Locked_Toggle_AriaInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Locked_Toggle_AriaInputs = {
    permission: NonNullable<unknown>;
    role: NonNullable<unknown>;
};
