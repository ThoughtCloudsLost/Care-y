/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Followup_Not_OwnedInputs */

const en_error_followup_not_owned = /** @type {(inputs: Error_Followup_Not_OwnedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You can only modify your own notes.`)
};

const es_error_followup_not_owned = /** @type {(inputs: Error_Followup_Not_OwnedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo puedes modificar tus propias notas.`)
};

const en_xa2_error_followup_not_owned = /** @type {(inputs: Error_Followup_Not_OwnedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòù càn ònly mòdìfy yòùr òwn nòtès. •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "You can only modify your own notes." |
*
* @param {Error_Followup_Not_OwnedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_followup_not_owned = /** @type {((inputs?: Error_Followup_Not_OwnedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Followup_Not_OwnedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_followup_not_owned(inputs)
	if (locale === "en-XA") return en_xa2_error_followup_not_owned(inputs)
	return en_error_followup_not_owned(inputs)
});