/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Push_No_SubscriptionInputs */

const en_twofa_push_no_subscription = /** @type {(inputs: Twofa_Push_No_SubscriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No push subscription found. Enable notifications in your browser first.`)
};

const es_twofa_push_no_subscription = /** @type {(inputs: Twofa_Push_No_SubscriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se encontró suscripción push. Habilita las notificaciones en tu navegador primero.`)
};

/**
* | output |
* | --- |
* | "No push subscription found. Enable notifications in your browser first." |
*
* @param {Twofa_Push_No_SubscriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_push_no_subscription = /** @type {((inputs?: Twofa_Push_No_SubscriptionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Push_No_SubscriptionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_push_no_subscription(inputs)
	return es_twofa_push_no_subscription(inputs)
});