/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Revoke_Reply_Token_Confirm_ActionInputs */

const en_revoke_reply_token_confirm_action = /** @type {(inputs: Revoke_Reply_Token_Confirm_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revoke`)
};

const es_revoke_reply_token_confirm_action = /** @type {(inputs: Revoke_Reply_Token_Confirm_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revocar`)
};

const en_xa2_revoke_reply_token_confirm_action = /** @type {(inputs: Revoke_Reply_Token_Confirm_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèvòkè ••⟧`)
};

/**
* | output |
* | --- |
* | "Revoke" |
*
* @param {Revoke_Reply_Token_Confirm_ActionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const revoke_reply_token_confirm_action = /** @type {((inputs?: Revoke_Reply_Token_Confirm_ActionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Revoke_Reply_Token_Confirm_ActionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_revoke_reply_token_confirm_action(inputs)
	if (locale === "en-XA") return en_xa2_revoke_reply_token_confirm_action(inputs)
	return en_revoke_reply_token_confirm_action(inputs)
});