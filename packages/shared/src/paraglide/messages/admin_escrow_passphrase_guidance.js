/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Passphrase_GuidanceInputs */

const en_admin_escrow_passphrase_guidance = /** @type {(inputs: Admin_Escrow_Passphrase_GuidanceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Use a long, memorable phrase. Example: four or more random words like 'morning river quiet lantern'. Longer is always better.`)
};

const es_admin_escrow_passphrase_guidance = /** @type {(inputs: Admin_Escrow_Passphrase_GuidanceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Use una frase larga y memorable. Ejemplo: cuatro o mas palabras aleatorias como 'manana rio tranquilo farol'. Mas larga siempre es mejor.`)
};

/**
* | output |
* | --- |
* | "Use a long, memorable phrase. Example: four or more random words like 'morning river quiet lantern'. Longer is always better." |
*
* @param {Admin_Escrow_Passphrase_GuidanceInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_passphrase_guidance = /** @type {((inputs?: Admin_Escrow_Passphrase_GuidanceInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Passphrase_GuidanceInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_passphrase_guidance(inputs)
	return es_admin_escrow_passphrase_guidance(inputs)
});