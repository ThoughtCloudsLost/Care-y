/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_LabelInputs */

const en_intake_forms_config_label = /** @type {(inputs: Intake_Forms_Config_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Question text`)
};

const es_intake_forms_config_label = /** @type {(inputs: Intake_Forms_Config_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Texto de la pregunta`)
};

const en_xa2_intake_forms_config_label = /** @type {(inputs: Intake_Forms_Config_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Qùèstìòn tèxt ••••⟧`)
};

/**
* | output |
* | --- |
* | "Question text" |
*
* @param {Intake_Forms_Config_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_label = /** @type {((inputs?: Intake_Forms_Config_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_label(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_label(inputs)
	return en_intake_forms_config_label(inputs)
});