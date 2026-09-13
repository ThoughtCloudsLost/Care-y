/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Intake_Slug_TakenInputs */

const en_error_intake_slug_taken = /** @type {(inputs: Error_Intake_Slug_TakenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`That link name is already in use by another form.`)
};

const es_error_intake_slug_taken = /** @type {(inputs: Error_Intake_Slug_TakenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ese nombre de enlace ya esta en uso por otro formulario.`)
};

/**
* | output |
* | --- |
* | "That link name is already in use by another form." |
*
* @param {Error_Intake_Slug_TakenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_intake_slug_taken = /** @type {((inputs?: Error_Intake_Slug_TakenInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Intake_Slug_TakenInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_intake_slug_taken(inputs)
	return es_error_intake_slug_taken(inputs)
});