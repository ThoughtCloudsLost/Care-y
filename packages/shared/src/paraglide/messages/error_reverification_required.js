/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Reverification_RequiredInputs */

const en_error_reverification_required = /** @type {(inputs: Error_Reverification_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone re-verification is required to enable this feature.`)
};

const es_error_reverification_required = /** @type {(inputs: Error_Reverification_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se requiere volver a verificar el teléfono para activar esta función.`)
};

const en_xa2_error_reverification_required = /** @type {(inputs: Error_Reverification_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phònè rè-vèrìfìcàtìòn ìs rèqùìrèd tò ènàblè thìs fèàtùrè. ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Phone re-verification is required to enable this feature." |
*
* @param {Error_Reverification_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_reverification_required = /** @type {((inputs?: Error_Reverification_RequiredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Reverification_RequiredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_reverification_required(inputs)
	if (locale === "en-XA") return en_xa2_error_reverification_required(inputs)
	return en_error_reverification_required(inputs)
});