/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Funds_ProtectedInputs */

const en_admin_funds_protected = /** @type {(inputs: Admin_Funds_ProtectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The server stores this fund only in encrypted form. It cannot read the name, the currency or any amount.`)
};

const es_admin_funds_protected = /** @type {(inputs: Admin_Funds_ProtectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El servidor guarda este fondo solo cifrado. No puede leer el nombre, la moneda ni ningún importe.`)
};

const en_xa2_admin_funds_protected = /** @type {(inputs: Admin_Funds_ProtectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè sèrvèr stòrès thìs fùnd ònly ìn èncryptèd fòrm. Ìt cànnòt rèàd thè nàmè, thè cùrrèncy òr àny àmòùnt. ••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The server stores this fund only in encrypted form. It cannot read the name, the currency or any amount." |
*
* @param {Admin_Funds_ProtectedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_protected = /** @type {((inputs?: Admin_Funds_ProtectedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Funds_ProtectedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_funds_protected(inputs)
	if (locale === "en-XA") return en_xa2_admin_funds_protected(inputs)
	return en_admin_funds_protected(inputs)
});