/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Role_Language_PreferenceInputs */

const en_intake_forms_config_role_language_preference = /** @type {(inputs: Intake_Forms_Config_Role_Language_PreferenceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Language preference`)
};

const es_intake_forms_config_role_language_preference = /** @type {(inputs: Intake_Forms_Config_Role_Language_PreferenceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preferencia de idioma`)
};

/**
* | output |
* | --- |
* | "Language preference" |
*
* @param {Intake_Forms_Config_Role_Language_PreferenceInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_language_preference = /** @type {((inputs?: Intake_Forms_Config_Role_Language_PreferenceInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Role_Language_PreferenceInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_role_language_preference(inputs)
	return es_intake_forms_config_role_language_preference(inputs)
});