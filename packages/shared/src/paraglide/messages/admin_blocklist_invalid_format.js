/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_Invalid_FormatInputs */

const en_admin_blocklist_invalid_format = /** @type {(inputs: Admin_Blocklist_Invalid_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter a valid phone number (at least 5 digits).`)
};

const es_admin_blocklist_invalid_format = /** @type {(inputs: Admin_Blocklist_Invalid_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingrese un número de teléfono válido (al menos 5 dígitos).`)
};

const en_xa2_admin_blocklist_invalid_format = /** @type {(inputs: Admin_Blocklist_Invalid_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntèr à vàlìd phònè nùmbèr (àt lèàst 5 dìgìts). •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enter a valid phone number (at least 5 digits)." |
*
* @param {Admin_Blocklist_Invalid_FormatInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_invalid_format = /** @type {((inputs?: Admin_Blocklist_Invalid_FormatInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_Invalid_FormatInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_blocklist_invalid_format(inputs)
	if (locale === "en-XA") return en_xa2_admin_blocklist_invalid_format(inputs)
	return en_admin_blocklist_invalid_format(inputs)
});