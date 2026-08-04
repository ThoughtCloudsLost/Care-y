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

/**
* | output |
* | --- |
* | "Event type" |
*
* @param {Logs_Filter_Event_TypeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_filter_event_type = /** @type {((inputs?: Logs_Filter_Event_TypeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Filter_Event_TypeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_logs_filter_event_type(inputs)
	return es_logs_filter_event_type(inputs)
});