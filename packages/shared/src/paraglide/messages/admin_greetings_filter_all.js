/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Filter_AllInputs */

const en_admin_greetings_filter_all = /** @type {(inputs: Admin_Greetings_Filter_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`All phones`)
};

const es_admin_greetings_filter_all = /** @type {(inputs: Admin_Greetings_Filter_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Todos los telefonos`)
};

/**
* | output |
* | --- |
* | "All phones" |
*
* @param {Admin_Greetings_Filter_AllInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_filter_all = /** @type {((inputs?: Admin_Greetings_Filter_AllInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Filter_AllInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_filter_all(inputs)
	return es_admin_greetings_filter_all(inputs)
});