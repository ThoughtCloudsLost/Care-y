/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Followup_Not_DeletableInputs */

const en_error_followup_not_deletable = /** @type {(inputs: Error_Followup_Not_DeletableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This follow-up cannot be deleted.`)
};

const es_error_followup_not_deletable = /** @type {(inputs: Error_Followup_Not_DeletableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este seguimiento no se puede eliminar.`)
};

const en_xa2_error_followup_not_deletable = /** @type {(inputs: Error_Followup_Not_DeletableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs fòllòw-ùp cànnòt bè dèlètèd. ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This follow-up cannot be deleted." |
*
* @param {Error_Followup_Not_DeletableInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_followup_not_deletable = /** @type {((inputs?: Error_Followup_Not_DeletableInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Followup_Not_DeletableInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_followup_not_deletable(inputs)
	if (locale === "en-XA") return en_xa2_error_followup_not_deletable(inputs)
	return en_error_followup_not_deletable(inputs)
});