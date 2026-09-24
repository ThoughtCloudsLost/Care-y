/**
* | output |
* | --- |
* | "Event type" |
*
* @param {Logs_Filter_Event_TypeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_filter_event_type: ((inputs?: Logs_Filter_Event_TypeInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Filter_Event_TypeInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Filter_Event_TypeInputs = {};
