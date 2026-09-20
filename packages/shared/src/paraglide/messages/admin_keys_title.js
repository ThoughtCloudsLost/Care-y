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

const en_xa2_admin_keys_title = /** @type {(inputs: Admin_Keys_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èncryptìòn Kèys •••••⟧`)
};

/**
* | output |
* | --- |
* | "Encryption Keys" |
*
* @param {Admin_Keys_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_keys_title = /** @type {((inputs?: Admin_Keys_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Keys_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_keys_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_keys_title(inputs)
	return en_admin_keys_title(inputs)
});