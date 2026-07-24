/**
* | output |
* | --- |
* | "Your role: {role}" |
*
* @param {Sidebar_Role_Badge_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const sidebar_role_badge_label: ((inputs: Sidebar_Role_Badge_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Sidebar_Role_Badge_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Sidebar_Role_Badge_LabelInputs = {
    role: NonNullable<unknown>;
};
