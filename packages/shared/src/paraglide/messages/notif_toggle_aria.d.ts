/**
* | output |
* | --- |
* | "{channel} for {event}" |
*
* @param {Notif_Toggle_AriaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_toggle_aria: ((inputs: Notif_Toggle_AriaInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Toggle_AriaInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Toggle_AriaInputs = {
    channel: NonNullable<unknown>;
    event: NonNullable<unknown>;
};
