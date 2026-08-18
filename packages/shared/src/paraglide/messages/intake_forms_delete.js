/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_DeleteInputs */

const en_intake_forms_delete = /** @type {(inputs: Intake_Forms_DeleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete form`)
};

const es_intake_forms_delete = /** @type {(inputs: Intake_Forms_DeleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar formulario`)
};

/**
* | output |
* | --- |
* | "Delete form" |
*
* @param {Intake_Forms_DeleteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_delete = /** @type {((inputs?: Intake_Forms_DeleteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_DeleteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_delete(inputs)
	return es_intake_forms_delete(inputs)
});