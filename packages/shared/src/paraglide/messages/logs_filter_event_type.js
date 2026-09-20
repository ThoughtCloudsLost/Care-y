/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Filter_Event_TypeInputs */

const en_logs_filter_event_type = /** @type {(inputs: Logs_Filter_Event_TypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Event type`)
};

const es_logs_filter_event_type = /** @type {(inputs: Logs_Filter_Event_TypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tipo de evento`)
};

const en_xa2_logs_filter_event_type = /** @type {(inputs: Logs_Filter_Event_TypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èvènt typè •••⟧`)
};

/**
* | output |
* | --- |
* | "Event type" |
*
* @param {Logs_Filter_Event_TypeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_filter_event_type = /** @type {((inputs?: Logs_Filter_Event_TypeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Filter_Event_TypeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_logs_filter_event_type(inputs)
	if (locale === "en-XA") return en_xa2_logs_filter_event_type(inputs)
	return en_logs_filter_event_type(inputs)
});