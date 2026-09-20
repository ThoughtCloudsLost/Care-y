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

const en_xa2_revoke_reply_token_success = /** @type {(inputs: Revoke_Reply_Token_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèply tòkèn rèvòkèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Reply token revoked" |
*
* @param {Revoke_Reply_Token_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const revoke_reply_token_success = /** @type {((inputs?: Revoke_Reply_Token_SuccessInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Revoke_Reply_Token_SuccessInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_revoke_reply_token_success(inputs)
	if (locale === "en-XA") return en_xa2_revoke_reply_token_success(inputs)
	return en_revoke_reply_token_success(inputs)
});