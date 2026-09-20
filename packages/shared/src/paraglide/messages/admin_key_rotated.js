/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Key_RotatedInputs */

const en_admin_key_rotated = /** @type {(inputs: Admin_Key_RotatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization key rotated`)
};

const es_admin_key_rotated = /** @type {(inputs: Admin_Key_RotatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clave de la organización rotada`)
};

const en_xa2_admin_key_rotated = /** @type {(inputs: Admin_Key_RotatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òrgànìzàtìòn kèy ròtàtèd ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Organization key rotated" |
*
* @param {Admin_Key_RotatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_key_rotated = /** @type {((inputs?: Admin_Key_RotatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Key_RotatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_key_rotated(inputs)
	if (locale === "en-XA") return en_xa2_admin_key_rotated(inputs)
	return en_admin_key_rotated(inputs)
});