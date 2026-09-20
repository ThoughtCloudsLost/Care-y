/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_DoneInputs */

const en_admin_escrow_done = /** @type {(inputs: Admin_Escrow_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Done`)
};

const es_admin_escrow_done = /** @type {(inputs: Admin_Escrow_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Listo`)
};

const en_xa2_admin_escrow_done = /** @type {(inputs: Admin_Escrow_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dònè ••⟧`)
};

/**
* | output |
* | --- |
* | "Done" |
*
* @param {Admin_Escrow_DoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_done = /** @type {((inputs?: Admin_Escrow_DoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_DoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_escrow_done(inputs)
	if (locale === "en-XA") return en_xa2_admin_escrow_done(inputs)
	return en_admin_escrow_done(inputs)
});