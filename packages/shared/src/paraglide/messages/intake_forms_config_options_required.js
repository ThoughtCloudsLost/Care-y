/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Options_RequiredInputs */

const en_intake_forms_config_options_required = /** @type {(inputs: Intake_Forms_Config_Options_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add at least one option`)
};

const es_intake_forms_config_options_required = /** @type {(inputs: Intake_Forms_Config_Options_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agrega al menos una opción`)
};

const en_xa2_intake_forms_config_options_required = /** @type {(inputs: Intake_Forms_Config_Options_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd àt lèàst ònè òptìòn •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Add at least one option" |
*
* @param {Intake_Forms_Config_Options_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_options_required = /** @type {((inputs?: Intake_Forms_Config_Options_RequiredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Options_RequiredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_options_required(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_options_required(inputs)
	return en_intake_forms_config_options_required(inputs)
});