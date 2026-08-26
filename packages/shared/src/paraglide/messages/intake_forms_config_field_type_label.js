/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Field_Type_LabelInputs */

const en_intake_forms_config_field_type_label = /** @type {(inputs: Intake_Forms_Config_Field_Type_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Field type`)
};

const es_intake_forms_config_field_type_label = /** @type {(inputs: Intake_Forms_Config_Field_Type_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tipo de campo`)
};

/**
* | output |
* | --- |
* | "Field type" |
*
* @param {Intake_Forms_Config_Field_Type_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_field_type_label = /** @type {((inputs?: Intake_Forms_Config_Field_Type_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Field_Type_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_field_type_label(inputs)
	return es_intake_forms_config_field_type_label(inputs)
});