/**
* | output |
* | --- |
* | "{channel} for {event}" |
*
* @param {Notif_Toggle_AriaInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_toggle_aria: ((inputs: Notif_Toggle_AriaInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Toggle_AriaInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Toggle_AriaInputs = {
    channel: NonNullable<unknown>;
    event: NonNullable<unknown>;
};
