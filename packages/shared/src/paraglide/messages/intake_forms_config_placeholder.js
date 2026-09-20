/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_PlaceholderInputs */

const en_intake_forms_config_placeholder = /** @type {(inputs: Intake_Forms_Config_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Placeholder text`)
};

const es_intake_forms_config_placeholder = /** @type {(inputs: Intake_Forms_Config_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Texto de ejemplo`)
};

const en_xa2_intake_forms_config_placeholder = /** @type {(inputs: Intake_Forms_Config_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Plàcèhòldèr tèxt •••••⟧`)
};

/**
* | output |
* | --- |
* | "Placeholder text" |
*
* @param {Intake_Forms_Config_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_placeholder = /** @type {((inputs?: Intake_Forms_Config_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_placeholder(inputs)
	return en_intake_forms_config_placeholder(inputs)
});