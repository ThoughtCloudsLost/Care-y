/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Filter_AllInputs */

const en_admin_greetings_filter_all = /** @type {(inputs: Admin_Greetings_Filter_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`All phones`)
};

const es_admin_greetings_filter_all = /** @type {(inputs: Admin_Greetings_Filter_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Todos los teléfonos`)
};

const en_xa2_admin_greetings_filter_all = /** @type {(inputs: Admin_Greetings_Filter_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àll phònès •••⟧`)
};

/**
* | output |
* | --- |
* | "All phones" |
*
* @param {Admin_Greetings_Filter_AllInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_filter_all = /** @type {((inputs?: Admin_Greetings_Filter_AllInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Filter_AllInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_filter_all(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_filter_all(inputs)
	return en_admin_greetings_filter_all(inputs)
});