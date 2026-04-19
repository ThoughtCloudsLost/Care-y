/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blacklist_FilterInputs */

const en_admin_blacklist_filter = /** @type {(inputs: Admin_Blacklist_FilterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filter blocked numbers...`)
};

const es_admin_blacklist_filter = /** @type {(inputs: Admin_Blacklist_FilterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filtrar numeros bloqueados...`)
};

/**
* | output |
* | --- |
* | "Filter blocked numbers..." |
*
* @param {Admin_Blacklist_FilterInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blacklist_filter = /** @type {((inputs?: Admin_Blacklist_FilterInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blacklist_FilterInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_blacklist_filter(inputs)
	return es_admin_blacklist_filter(inputs)
});