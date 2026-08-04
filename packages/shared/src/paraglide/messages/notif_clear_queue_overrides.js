/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Clear_Queue_OverridesInputs */

const en_notif_clear_queue_overrides = /** @type {(inputs: Notif_Clear_Queue_OverridesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clear overrides for this queue`)
};

const es_notif_clear_queue_overrides = /** @type {(inputs: Notif_Clear_Queue_OverridesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Borrar excepciones de esta cola`)
};

/**
* | output |
* | --- |
* | "Clear overrides for this queue" |
*
* @param {Notif_Clear_Queue_OverridesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_clear_queue_overrides = /** @type {((inputs?: Notif_Clear_Queue_OverridesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Clear_Queue_OverridesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_clear_queue_overrides(inputs)
	return es_notif_clear_queue_overrides(inputs)
});