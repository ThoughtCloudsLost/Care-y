/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Create_TitleInputs */

const en_intake_forms_create_title = /** @type {(inputs: Intake_Forms_Create_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create Form`)
};

const es_intake_forms_create_title = /** @type {(inputs: Intake_Forms_Create_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear formulario`)
};

/**
* | output |
* | --- |
* | "Create Form" |
*
* @param {Intake_Forms_Create_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_create_title = /** @type {((inputs?: Intake_Forms_Create_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Create_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_create_title(inputs)
	return es_intake_forms_create_title(inputs)
});