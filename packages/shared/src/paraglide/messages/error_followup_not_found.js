/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Followup_Not_FoundInputs */

const en_error_followup_not_found = /** @type {(inputs: Error_Followup_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Follow-up not found.`)
};

const es_error_followup_not_found = /** @type {(inputs: Error_Followup_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seguimiento no encontrado.`)
};

const en_xa2_error_followup_not_found = /** @type {(inputs: Error_Followup_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fòllòw-ùp nòt fòùnd. ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Follow-up not found." |
*
* @param {Error_Followup_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_followup_not_found = /** @type {((inputs?: Error_Followup_Not_FoundInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Followup_Not_FoundInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_followup_not_found(inputs)
	if (locale === "en-XA") return en_xa2_error_followup_not_found(inputs)
	return en_error_followup_not_found(inputs)
});