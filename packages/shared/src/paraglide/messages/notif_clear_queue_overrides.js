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

const en_xa2_notif_clear_queue_overrides = /** @type {(inputs: Notif_Clear_Queue_OverridesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clèàr òvèrrìdès fòr thìs qùèùè •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Clear overrides for this queue" |
*
* @param {Notif_Clear_Queue_OverridesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_clear_queue_overrides = /** @type {((inputs?: Notif_Clear_Queue_OverridesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Clear_Queue_OverridesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_clear_queue_overrides(inputs)
	if (locale === "en-XA") return en_xa2_notif_clear_queue_overrides(inputs)
	return en_notif_clear_queue_overrides(inputs)
});