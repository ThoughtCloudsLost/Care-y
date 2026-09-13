/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Reachability_CallableInputs */

const en_admin_reachability_callable = /** @type {(inputs: Admin_Reachability_CallableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Callable`)
};

const es_admin_reachability_callable = /** @type {(inputs: Admin_Reachability_CallableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contactable`)
};

/**
* | output |
* | --- |
* | "Callable" |
*
* @param {Admin_Reachability_CallableInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reachability_callable = /** @type {((inputs?: Admin_Reachability_CallableInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reachability_CallableInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_reachability_callable(inputs)
	return es_admin_reachability_callable(inputs)
});