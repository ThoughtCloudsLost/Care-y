/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Revoke_Reply_Token_LabelInputs */

const en_revoke_reply_token_label = /** @type {(inputs: Revoke_Reply_Token_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revoke email reply token`)
};

const es_revoke_reply_token_label = /** @type {(inputs: Revoke_Reply_Token_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revocar token de respuesta por correo`)
};

const en_xa2_revoke_reply_token_label = /** @type {(inputs: Revoke_Reply_Token_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèvòkè èmàìl rèply tòkèn ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Revoke email reply token" |
*
* @param {Revoke_Reply_Token_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const revoke_reply_token_label = /** @type {((inputs?: Revoke_Reply_Token_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Revoke_Reply_Token_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_revoke_reply_token_label(inputs)
	if (locale === "en-XA") return en_xa2_revoke_reply_token_label(inputs)
	return en_revoke_reply_token_label(inputs)
});