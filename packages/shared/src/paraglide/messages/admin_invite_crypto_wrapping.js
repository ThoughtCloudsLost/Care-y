/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Crypto_WrappingInputs */

const en_admin_invite_crypto_wrapping = /** @type {(inputs: Admin_Invite_Crypto_WrappingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Distributing organization key...`)
};

const es_admin_invite_crypto_wrapping = /** @type {(inputs: Admin_Invite_Crypto_WrappingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Distribuyendo clave de la organización...`)
};

const en_xa2_admin_invite_crypto_wrapping = /** @type {(inputs: Admin_Invite_Crypto_WrappingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìstrìbùtìng òrgànìzàtìòn kèy... ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Distributing organization key..." |
*
* @param {Admin_Invite_Crypto_WrappingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_crypto_wrapping = /** @type {((inputs?: Admin_Invite_Crypto_WrappingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Crypto_WrappingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_crypto_wrapping(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_crypto_wrapping(inputs)
	return en_admin_invite_crypto_wrapping(inputs)
});