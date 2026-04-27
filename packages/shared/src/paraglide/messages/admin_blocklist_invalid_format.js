/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_Invalid_FormatInputs */

const en_admin_blocklist_invalid_format = /** @type {(inputs: Admin_Blocklist_Invalid_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter a valid phone number (at least 5 digits).`)
};

const es_admin_blocklist_invalid_format = /** @type {(inputs: Admin_Blocklist_Invalid_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingrese un numero de telefono valido (al menos 5 digitos).`)
};

/**
* | output |
* | --- |
* | "Enter a valid phone number (at least 5 digits)." |
*
* @param {Admin_Blocklist_Invalid_FormatInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_invalid_format = /** @type {((inputs?: Admin_Blocklist_Invalid_FormatInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_Invalid_FormatInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_blocklist_invalid_format(inputs)
	return es_admin_blocklist_invalid_format(inputs)
});