/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Crypto_CompleteInputs */

const en_admin_invite_crypto_complete = /** @type {(inputs: Admin_Invite_Crypto_CompleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Keys distributed successfully`)
};

const es_admin_invite_crypto_complete = /** @type {(inputs: Admin_Invite_Crypto_CompleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Claves distribuidas exitosamente`)
};

/**
* | output |
* | --- |
* | "Keys distributed successfully" |
*
* @param {Admin_Invite_Crypto_CompleteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_crypto_complete = /** @type {((inputs?: Admin_Invite_Crypto_CompleteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Crypto_CompleteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_crypto_complete(inputs)
	return es_admin_invite_crypto_complete(inputs)
});