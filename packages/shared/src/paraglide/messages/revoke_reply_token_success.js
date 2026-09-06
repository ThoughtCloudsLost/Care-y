/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Revoke_Reply_Token_SuccessInputs */

const en_revoke_reply_token_success = /** @type {(inputs: Revoke_Reply_Token_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reply token revoked`)
};

const es_revoke_reply_token_success = /** @type {(inputs: Revoke_Reply_Token_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Token de respuesta revocado`)
};

/**
* | output |
* | --- |
* | "Reply token revoked" |
*
* @param {Revoke_Reply_Token_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const revoke_reply_token_success = /** @type {((inputs?: Revoke_Reply_Token_SuccessInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Revoke_Reply_Token_SuccessInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_revoke_reply_token_success(inputs)
	return es_revoke_reply_token_success(inputs)
});