/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Edit_TitleInputs */

const en_intake_forms_edit_title = /** @type {(inputs: Intake_Forms_Edit_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit Form`)
};

const es_intake_forms_edit_title = /** @type {(inputs: Intake_Forms_Edit_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar formulario`)
};

/**
* | output |
* | --- |
* | "Edit Form" |
*
* @param {Intake_Forms_Edit_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_edit_title = /** @type {((inputs?: Intake_Forms_Edit_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Edit_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_edit_title(inputs)
	return es_intake_forms_edit_title(inputs)
});