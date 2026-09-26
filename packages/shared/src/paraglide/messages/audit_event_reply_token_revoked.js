/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Reply_Token_RevokedInputs */

const en_audit_event_reply_token_revoked = /** @type {(inputs: Audit_Event_Reply_Token_RevokedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email reply token revoked`)
};

const es_audit_event_reply_token_revoked = /** @type {(inputs: Audit_Event_Reply_Token_RevokedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Token de respuesta por correo revocado`)
};

const en_xa2_audit_event_reply_token_revoked = /** @type {(inputs: Audit_Event_Reply_Token_RevokedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èmàìl rèply tòkèn rèvòkèd ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Email reply token revoked" |
*
* @param {Audit_Event_Reply_Token_RevokedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_reply_token_revoked = /** @type {((inputs?: Audit_Event_Reply_Token_RevokedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Reply_Token_RevokedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_reply_token_revoked(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_reply_token_revoked(inputs)
	return en_audit_event_reply_token_revoked(inputs)
});