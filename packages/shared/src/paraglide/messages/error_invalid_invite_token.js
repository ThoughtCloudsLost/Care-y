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

/**
* | output |
* | --- |
* | "This invite link is invalid or has expired." |
*
* @param {Error_Invalid_Invite_TokenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_invalid_invite_token = /** @type {((inputs?: Error_Invalid_Invite_TokenInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Invalid_Invite_TokenInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_invalid_invite_token(inputs)
	return es_error_invalid_invite_token(inputs)
});