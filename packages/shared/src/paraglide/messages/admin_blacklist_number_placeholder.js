/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blacklist_Number_PlaceholderInputs */

const en_admin_blacklist_number_placeholder = /** @type {(inputs: Admin_Blacklist_Number_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`555-123-4567`)
};

const es_admin_blacklist_number_placeholder = /** @type {(inputs: Admin_Blacklist_Number_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`555-123-4567`)
};

/**
* | output |
* | --- |
* | "555-123-4567" |
*
* @param {Admin_Blacklist_Number_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blacklist_number_placeholder = /** @type {((inputs?: Admin_Blacklist_Number_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blacklist_Number_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_blacklist_number_placeholder(inputs)
	return es_admin_blacklist_number_placeholder(inputs)
});