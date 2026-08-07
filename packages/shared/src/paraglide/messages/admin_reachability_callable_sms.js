/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Reachability_Callable_SmsInputs */

const en_admin_reachability_callable_sms = /** @type {(inputs: Admin_Reachability_Callable_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Callable + SMS`)
};

const es_admin_reachability_callable_sms = /** @type {(inputs: Admin_Reachability_Callable_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contactable + SMS`)
};

/**
* | output |
* | --- |
* | "Callable + SMS" |
*
* @param {Admin_Reachability_Callable_SmsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reachability_callable_sms = /** @type {((inputs?: Admin_Reachability_Callable_SmsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reachability_Callable_SmsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_reachability_callable_sms(inputs)
	return es_admin_reachability_callable_sms(inputs)
});