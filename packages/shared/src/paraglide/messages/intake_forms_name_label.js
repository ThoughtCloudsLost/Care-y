/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Name_LabelInputs */

const en_intake_forms_name_label = /** @type {(inputs: Intake_Forms_Name_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Form name`)
};

const es_intake_forms_name_label = /** @type {(inputs: Intake_Forms_Name_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre del formulario`)
};

const en_xa2_intake_forms_name_label = /** @type {(inputs: Intake_Forms_Name_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fòrm nàmè •••⟧`)
};

/**
* | output |
* | --- |
* | "Form name" |
*
* @param {Intake_Forms_Name_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_name_label = /** @type {((inputs?: Intake_Forms_Name_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Name_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_name_label(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_name_label(inputs)
	return en_intake_forms_name_label(inputs)
});