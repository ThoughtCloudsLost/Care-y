/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_TitleInputs */

const en_intake_forms_config_title = /** @type {(inputs: Intake_Forms_Config_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configure field`)
};

const es_intake_forms_config_title = /** @type {(inputs: Intake_Forms_Config_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configurar campo`)
};

/**
* | output |
* | --- |
* | "Configure field" |
*
* @param {Intake_Forms_Config_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_title = /** @type {((inputs?: Intake_Forms_Config_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_title(inputs)
	return es_intake_forms_config_title(inputs)
});