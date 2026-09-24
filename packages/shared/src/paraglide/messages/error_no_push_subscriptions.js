/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_No_Push_SubscriptionsInputs */

const en_error_no_push_subscriptions = /** @type {(inputs: Error_No_Push_SubscriptionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No push subscriptions found. Subscribe a device first.`)
};

const es_error_no_push_subscriptions = /** @type {(inputs: Error_No_Push_SubscriptionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se encontraron suscripciones push. Suscribe un dispositivo primero.`)
};

const en_xa2_error_no_push_subscriptions = /** @type {(inputs: Error_No_Push_SubscriptionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò pùsh sùbscrìptìòns fòùnd. Sùbscrìbè à dèvìcè fìrst. •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No push subscriptions found. Subscribe a device first." |
*
* @param {Error_No_Push_SubscriptionsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_no_push_subscriptions = /** @type {((inputs?: Error_No_Push_SubscriptionsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_No_Push_SubscriptionsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_no_push_subscriptions(inputs)
	if (locale === "en-XA") return en_xa2_error_no_push_subscriptions(inputs)
	return en_error_no_push_subscriptions(inputs)
});