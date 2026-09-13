/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_SavedInputs */

const en_intake_forms_saved = /** @type {(inputs: Intake_Forms_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Form saved`)
};

const es_intake_forms_saved = /** @type {(inputs: Intake_Forms_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Formulario guardado`)
};

/**
* | output |
* | --- |
* | "Form saved" |
*
* @param {Intake_Forms_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_saved = /** @type {((inputs?: Intake_Forms_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_saved(inputs)
	return es_intake_forms_saved(inputs)
});