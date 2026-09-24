/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Field_Type_MultiselectInputs */

const en_intake_forms_field_type_multiselect = /** @type {(inputs: Intake_Forms_Field_Type_MultiselectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Checkboxes`)
};

const es_intake_forms_field_type_multiselect = /** @type {(inputs: Intake_Forms_Field_Type_MultiselectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Casillas de verificación`)
};

const en_xa2_intake_forms_field_type_multiselect = /** @type {(inputs: Intake_Forms_Field_Type_MultiselectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chèckbòxès •••⟧`)
};

/**
* | output |
* | --- |
* | "Checkboxes" |
*
* @param {Intake_Forms_Field_Type_MultiselectInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_multiselect = /** @type {((inputs?: Intake_Forms_Field_Type_MultiselectInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Type_MultiselectInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_field_type_multiselect(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_field_type_multiselect(inputs)
	return en_intake_forms_field_type_multiselect(inputs)
});