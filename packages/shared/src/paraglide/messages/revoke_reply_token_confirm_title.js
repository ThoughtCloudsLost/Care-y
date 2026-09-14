/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Revoke_Reply_Token_Confirm_TitleInputs */

const en_revoke_reply_token_confirm_title = /** @type {(inputs: Revoke_Reply_Token_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revoke reply token?`)
};

const es_revoke_reply_token_confirm_title = /** @type {(inputs: Revoke_Reply_Token_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Revocar token de respuesta?`)
};

/**
* | output |
* | --- |
* | "Revoke reply token?" |
*
* @param {Revoke_Reply_Token_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const revoke_reply_token_confirm_title = /** @type {((inputs?: Revoke_Reply_Token_Confirm_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Revoke_Reply_Token_Confirm_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_revoke_reply_token_confirm_title(inputs)
	return en_revoke_reply_token_confirm_title(inputs)
});