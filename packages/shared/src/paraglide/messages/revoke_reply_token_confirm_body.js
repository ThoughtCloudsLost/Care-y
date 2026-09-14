/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Revoke_Reply_Token_Confirm_BodyInputs */

const en_revoke_reply_token_confirm_body = /** @type {(inputs: Revoke_Reply_Token_Confirm_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The client will no longer be able to reply to emails for this ticket. A new token will be created on the next outbound email.`)
};

const es_revoke_reply_token_confirm_body = /** @type {(inputs: Revoke_Reply_Token_Confirm_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El cliente ya no podrá responder a los correos de este caso. Se creará un token nuevo en el próximo correo saliente.`)
};

/**
* | output |
* | --- |
* | "The client will no longer be able to reply to emails for this ticket. A new token will be created on the next outbound email." |
*
* @param {Revoke_Reply_Token_Confirm_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const revoke_reply_token_confirm_body = /** @type {((inputs?: Revoke_Reply_Token_Confirm_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Revoke_Reply_Token_Confirm_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_revoke_reply_token_confirm_body(inputs)
	return en_revoke_reply_token_confirm_body(inputs)
});