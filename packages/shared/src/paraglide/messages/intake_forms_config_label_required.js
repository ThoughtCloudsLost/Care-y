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

const en_xa2_intake_forms_config_label_required = /** @type {(inputs: Intake_Forms_Config_Label_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntèr thè qùèstìòn tèxt •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enter the question text" |
*
* @param {Intake_Forms_Config_Label_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_label_required = /** @type {((inputs?: Intake_Forms_Config_Label_RequiredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Label_RequiredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_label_required(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_label_required(inputs)
	return en_intake_forms_config_label_required(inputs)
});