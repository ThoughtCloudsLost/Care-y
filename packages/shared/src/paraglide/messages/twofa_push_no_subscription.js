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

const en_xa2_twofa_push_no_subscription = /** @type {(inputs: Twofa_Push_No_SubscriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòtìfìcàtìòns àrè òff ìn thìs bròwsèr. Tùrn thèm òn fìrst, thèn try àgàìn. •••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Notifications are off in this browser. Turn them on first, then try again." |
*
* @param {Twofa_Push_No_SubscriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_push_no_subscription = /** @type {((inputs?: Twofa_Push_No_SubscriptionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Push_No_SubscriptionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_push_no_subscription(inputs)
	if (locale === "en-XA") return en_xa2_twofa_push_no_subscription(inputs)
	return en_twofa_push_no_subscription(inputs)
});