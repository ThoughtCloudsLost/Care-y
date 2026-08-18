/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_DeletedInputs */

const en_intake_forms_deleted = /** @type {(inputs: Intake_Forms_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Form deleted`)
};

const es_intake_forms_deleted = /** @type {(inputs: Intake_Forms_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Formulario eliminado`)
};

/**
* | output |
* | --- |
* | "Form deleted" |
*
* @param {Intake_Forms_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_deleted = /** @type {((inputs?: Intake_Forms_DeletedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_DeletedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_deleted(inputs)
	return es_intake_forms_deleted(inputs)
});