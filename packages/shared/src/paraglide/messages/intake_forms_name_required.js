/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Name_RequiredInputs */

const en_intake_forms_name_required = /** @type {(inputs: Intake_Forms_Name_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Form name is required.`)
};

const es_intake_forms_name_required = /** @type {(inputs: Intake_Forms_Name_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El nombre del formulario es obligatorio.`)
};

/**
* | output |
* | --- |
* | "Form name is required." |
*
* @param {Intake_Forms_Name_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_name_required = /** @type {((inputs?: Intake_Forms_Name_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Name_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_name_required(inputs)
	return es_intake_forms_name_required(inputs)
});