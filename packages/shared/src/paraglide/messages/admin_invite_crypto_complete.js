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

const en_xa2_admin_invite_crypto_complete = /** @type {(inputs: Admin_Invite_Crypto_CompleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Kèys dìstrìbùtèd sùccèssfùlly •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Keys distributed successfully" |
*
* @param {Admin_Invite_Crypto_CompleteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_crypto_complete = /** @type {((inputs?: Admin_Invite_Crypto_CompleteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Crypto_CompleteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_crypto_complete(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_crypto_complete(inputs)
	return en_admin_invite_crypto_complete(inputs)
});