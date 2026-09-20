/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Invalid_Invite_TokenInputs */

const en_error_invalid_invite_token = /** @type {(inputs: Error_Invalid_Invite_TokenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This invite link is invalid or has expired.`)
};

const es_error_invalid_invite_token = /** @type {(inputs: Error_Invalid_Invite_TokenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este enlace de invitación es inválido o ha expirado.`)
};

const en_xa2_error_invalid_invite_token = /** @type {(inputs: Error_Invalid_Invite_TokenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs ìnvìtè lìnk ìs ìnvàlìd òr hàs èxpìrèd. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This invite link is invalid or has expired." |
*
* @param {Error_Invalid_Invite_TokenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_invalid_invite_token = /** @type {((inputs?: Error_Invalid_Invite_TokenInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Invalid_Invite_TokenInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_invalid_invite_token(inputs)
	if (locale === "en-XA") return en_xa2_error_invalid_invite_token(inputs)
	return en_error_invalid_invite_token(inputs)
});