/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown>, ticket: NonNullable<unknown> }} Dashboard_Encrypted_HelpInputs */

const en_dashboard_encrypted_help = /** @type {(inputs: Dashboard_Encrypted_HelpInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`You have ${i?.queue} access but not the decryption key for this ${i?.ticket}. A teammate who can read it will share access automatically when they open it.`)
};

const es_dashboard_encrypted_help = /** @type {(inputs: Dashboard_Encrypted_HelpInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Tienes acceso a la ${i?.queue} pero no la clave de descifrado para este ${i?.ticket}. Un companero que pueda leerlo compartira el acceso automaticamente cuando lo abra.`)
};

/**
* | output |
* | --- |
* | "You have {queue} access but not the decryption key for this {ticket}. A teammate who can read it will share access automatically when they open it." |
*
* @param {Dashboard_Encrypted_HelpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_encrypted_help = /** @type {((inputs: Dashboard_Encrypted_HelpInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Encrypted_HelpInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_encrypted_help(inputs)
	return es_dashboard_encrypted_help(inputs)
});