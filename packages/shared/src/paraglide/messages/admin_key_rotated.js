/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Key_RotatedInputs */

const en_admin_key_rotated = /** @type {(inputs: Admin_Key_RotatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization key rotated`)
};

const es_admin_key_rotated = /** @type {(inputs: Admin_Key_RotatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clave de la organizacion rotada`)
};

/**
* | output |
* | --- |
* | "Organization key rotated" |
*
* @param {Admin_Key_RotatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_key_rotated = /** @type {((inputs?: Admin_Key_RotatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Key_RotatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_key_rotated(inputs)
	return es_admin_key_rotated(inputs)
});