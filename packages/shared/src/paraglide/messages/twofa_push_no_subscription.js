/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Push_No_SubscriptionInputs */

const en_twofa_push_no_subscription = /** @type {(inputs: Twofa_Push_No_SubscriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notifications are off in this browser. Turn them on first, then try again.`)
};

const es_twofa_push_no_subscription = /** @type {(inputs: Twofa_Push_No_SubscriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las notificaciones están desactivadas en este navegador. Actívalas primero e inténtalo de nuevo.`)
};

/**
* | output |
* | --- |
* | "Notifications are off in this browser. Turn them on first, then try again." |
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