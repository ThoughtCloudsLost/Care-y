/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Coming_SoonInputs */

const en_admin_coming_soon = /** @type {(inputs: Admin_Coming_SoonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Coming soon`)
};

const es_admin_coming_soon = /** @type {(inputs: Admin_Coming_SoonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Proximamente`)
};

/**
* | output |
* | --- |
* | "Coming soon" |
*
* @param {Admin_Coming_SoonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_coming_soon = /** @type {((inputs?: Admin_Coming_SoonInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Coming_SoonInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_coming_soon(inputs)
	return es_admin_coming_soon(inputs)
});