/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Keys_TitleInputs */

const en_admin_keys_title = /** @type {(inputs: Admin_Keys_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Encryption Keys`)
};

const es_admin_keys_title = /** @type {(inputs: Admin_Keys_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Claves de cifrado`)
};

/**
* | output |
* | --- |
* | "Encryption Keys" |
*
* @param {Admin_Keys_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_keys_title = /** @type {((inputs?: Admin_Keys_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Keys_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_keys_title(inputs)
	return es_admin_keys_title(inputs)
});