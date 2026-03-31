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

/**
* | output |
* | --- |
* | "No push subscriptions found. Subscribe a device first." |
*
* @param {Error_No_Push_SubscriptionsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_no_push_subscriptions = /** @type {((inputs?: Error_No_Push_SubscriptionsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_No_Push_SubscriptionsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_no_push_subscriptions(inputs)
	return es_error_no_push_subscriptions(inputs)
});