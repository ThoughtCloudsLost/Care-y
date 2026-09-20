/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Intake_Slug_TakenInputs */

const en_error_intake_slug_taken = /** @type {(inputs: Error_Intake_Slug_TakenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`That link name is already in use by another form.`)
};

const es_error_intake_slug_taken = /** @type {(inputs: Error_Intake_Slug_TakenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ese nombre de enlace ya está en uso por otro formulario.`)
};

const en_xa2_error_intake_slug_taken = /** @type {(inputs: Error_Intake_Slug_TakenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thàt lìnk nàmè ìs àlrèàdy ìn ùsè by ànòthèr fòrm. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "That link name is already in use by another form." |
*
* @param {Error_Intake_Slug_TakenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_intake_slug_taken = /** @type {((inputs?: Error_Intake_Slug_TakenInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Intake_Slug_TakenInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_intake_slug_taken(inputs)
	if (locale === "en-XA") return en_xa2_error_intake_slug_taken(inputs)
	return en_error_intake_slug_taken(inputs)
});