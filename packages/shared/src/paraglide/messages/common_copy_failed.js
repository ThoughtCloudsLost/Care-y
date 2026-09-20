/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_Copy_FailedInputs */

const en_common_copy_failed = /** @type {(inputs: Common_Copy_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not copy to clipboard.`)
};

const es_common_copy_failed = /** @type {(inputs: Common_Copy_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo copiar al portapapeles.`)
};

const en_xa2_common_copy_failed = /** @type {(inputs: Common_Copy_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt còpy tò clìpbòàrd. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Could not copy to clipboard." |
*
* @param {Common_Copy_FailedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const common_copy_failed = /** @type {((inputs?: Common_Copy_FailedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Copy_FailedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_common_copy_failed(inputs)
	if (locale === "en-XA") return en_xa2_common_copy_failed(inputs)
	return en_common_copy_failed(inputs)
});