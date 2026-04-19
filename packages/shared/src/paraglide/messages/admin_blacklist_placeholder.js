/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blacklist_PlaceholderInputs */

const en_admin_blacklist_placeholder = /** @type {(inputs: Admin_Blacklist_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Coming in a future update`)
};

const es_admin_blacklist_placeholder = /** @type {(inputs: Admin_Blacklist_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Disponible en una futura actualizacion`)
};

/**
* | output |
* | --- |
* | "Coming in a future update" |
*
* @param {Admin_Blacklist_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blacklist_placeholder = /** @type {((inputs?: Admin_Blacklist_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blacklist_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_blacklist_placeholder(inputs)
	return es_admin_blacklist_placeholder(inputs)
});