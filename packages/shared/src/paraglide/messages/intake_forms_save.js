/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_SaveInputs */

const en_intake_forms_save = /** @type {(inputs: Intake_Forms_SaveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save form`)
};

const es_intake_forms_save = /** @type {(inputs: Intake_Forms_SaveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar formulario`)
};

const en_xa2_intake_forms_save = /** @type {(inputs: Intake_Forms_SaveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvè fòrm •••⟧`)
};

/**
* | output |
* | --- |
* | "Save form" |
*
* @param {Intake_Forms_SaveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_save = /** @type {((inputs?: Intake_Forms_SaveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_SaveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_save(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_save(inputs)
	return en_intake_forms_save(inputs)
});