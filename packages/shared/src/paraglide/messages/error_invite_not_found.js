/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Invite_Not_FoundInputs */

const en_error_invite_not_found = /** @type {(inputs: Error_Invite_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invite not found or already used.`)
};

const es_error_invite_not_found = /** @type {(inputs: Error_Invite_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invitación no encontrada o ya utilizada.`)
};

const en_xa2_error_invite_not_found = /** @type {(inputs: Error_Invite_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìnvìtè nòt fòùnd òr àlrèàdy ùsèd. ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Invite not found or already used." |
*
* @param {Error_Invite_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_invite_not_found = /** @type {((inputs?: Error_Invite_Not_FoundInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Invite_Not_FoundInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_invite_not_found(inputs)
	if (locale === "en-XA") return en_xa2_error_invite_not_found(inputs)
	return en_error_invite_not_found(inputs)
});