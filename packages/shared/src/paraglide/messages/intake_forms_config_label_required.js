/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Label_RequiredInputs */

const en_intake_forms_config_label_required = /** @type {(inputs: Intake_Forms_Config_Label_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter the question text`)
};

const es_intake_forms_config_label_required = /** @type {(inputs: Intake_Forms_Config_Label_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escribe el texto de la pregunta`)
};

/**
* | output |
* | --- |
* | "Enter the question text" |
*
* @param {Intake_Forms_Config_Label_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_label_required = /** @type {((inputs?: Intake_Forms_Config_Label_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Label_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_label_required(inputs)
	return es_intake_forms_config_label_required(inputs)
});