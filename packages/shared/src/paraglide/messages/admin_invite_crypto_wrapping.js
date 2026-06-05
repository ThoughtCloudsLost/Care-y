/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Crypto_WrappingInputs */

const en_admin_invite_crypto_wrapping = /** @type {(inputs: Admin_Invite_Crypto_WrappingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Distributing organization key...`)
};

const es_admin_invite_crypto_wrapping = /** @type {(inputs: Admin_Invite_Crypto_WrappingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Distribuyendo clave de la organizacion...`)
};

/**
* | output |
* | --- |
* | "Distributing organization key..." |
*
* @param {Admin_Invite_Crypto_WrappingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_crypto_wrapping = /** @type {((inputs?: Admin_Invite_Crypto_WrappingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Crypto_WrappingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_crypto_wrapping(inputs)
	return es_admin_invite_crypto_wrapping(inputs)
});