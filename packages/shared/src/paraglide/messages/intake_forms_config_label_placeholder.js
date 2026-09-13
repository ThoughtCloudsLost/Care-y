/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Label_PlaceholderInputs */

const en_intake_forms_config_label_placeholder = /** @type {(inputs: Intake_Forms_Config_Label_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`e.g. What is the best way to reach you?`)
};

const es_intake_forms_config_label_placeholder = /** @type {(inputs: Intake_Forms_Config_Label_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ej. Cual es la mejor manera de contactarte?`)
};

/**
* | output |
* | --- |
* | "e.g. What is the best way to reach you?" |
*
* @param {Intake_Forms_Config_Label_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_label_placeholder = /** @type {((inputs?: Intake_Forms_Config_Label_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Label_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_label_placeholder(inputs)
	return es_intake_forms_config_label_placeholder(inputs)
});