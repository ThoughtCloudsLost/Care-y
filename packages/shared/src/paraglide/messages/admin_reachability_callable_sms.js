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

const en_xa2_admin_reachability_callable_sms = /** @type {(inputs: Admin_Reachability_Callable_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càllàblè + SMS •••••⟧`)
};

/**
* | output |
* | --- |
* | "Callable + SMS" |
*
* @param {Admin_Reachability_Callable_SmsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reachability_callable_sms = /** @type {((inputs?: Admin_Reachability_Callable_SmsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reachability_Callable_SmsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_reachability_callable_sms(inputs)
	if (locale === "en-XA") return en_xa2_admin_reachability_callable_sms(inputs)
	return en_admin_reachability_callable_sms(inputs)
});