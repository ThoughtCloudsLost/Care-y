/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_ErrorInputs */

const en_admin_escrow_error = /** @type {(inputs: Admin_Escrow_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Export failed`)
};

const es_admin_escrow_error = /** @type {(inputs: Admin_Escrow_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La exportación fallo`)
};

const en_xa2_admin_escrow_error = /** @type {(inputs: Admin_Escrow_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èxpòrt fàìlèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Export failed" |
*
* @param {Admin_Escrow_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_error = /** @type {((inputs?: Admin_Escrow_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_escrow_error(inputs)
	if (locale === "en-XA") return en_xa2_admin_escrow_error(inputs)
	return en_admin_escrow_error(inputs)
});