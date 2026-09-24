/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Crypto_DerivingInputs */

const en_admin_invite_crypto_deriving = /** @type {(inputs: Admin_Invite_Crypto_DerivingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generating encryption keys...`)
};

const es_admin_invite_crypto_deriving = /** @type {(inputs: Admin_Invite_Crypto_DerivingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generando claves de cifrado...`)
};

const en_xa2_admin_invite_crypto_deriving = /** @type {(inputs: Admin_Invite_Crypto_DerivingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Gènèràtìng èncryptìòn kèys... •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Generating encryption keys..." |
*
* @param {Admin_Invite_Crypto_DerivingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_crypto_deriving = /** @type {((inputs?: Admin_Invite_Crypto_DerivingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Crypto_DerivingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_crypto_deriving(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_crypto_deriving(inputs)
	return en_admin_invite_crypto_deriving(inputs)
});