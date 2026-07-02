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

/**
* | output |
* | --- |
* | "Generating encryption keys..." |
*
* @param {Admin_Invite_Crypto_DerivingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_crypto_deriving = /** @type {((inputs?: Admin_Invite_Crypto_DerivingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Crypto_DerivingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_crypto_deriving(inputs)
	return es_admin_invite_crypto_deriving(inputs)
});