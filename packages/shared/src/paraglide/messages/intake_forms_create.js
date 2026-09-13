/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_CreateInputs */

const en_intake_forms_create = /** @type {(inputs: Intake_Forms_CreateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create new form`)
};

const es_intake_forms_create = /** @type {(inputs: Intake_Forms_CreateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear nuevo formulario`)
};

/**
* | output |
* | --- |
* | "Create new form" |
*
* @param {Intake_Forms_CreateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_create = /** @type {((inputs?: Intake_Forms_CreateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_CreateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_create(inputs)
	return es_intake_forms_create(inputs)
});