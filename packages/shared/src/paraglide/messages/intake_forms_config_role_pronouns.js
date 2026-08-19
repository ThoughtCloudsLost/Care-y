/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Role_PronounsInputs */

const en_intake_forms_config_role_pronouns = /** @type {(inputs: Intake_Forms_Config_Role_PronounsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pronouns`)
};

const es_intake_forms_config_role_pronouns = /** @type {(inputs: Intake_Forms_Config_Role_PronounsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pronombres`)
};

/**
* | output |
* | --- |
* | "Pronouns" |
*
* @param {Intake_Forms_Config_Role_PronounsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_pronouns = /** @type {((inputs?: Intake_Forms_Config_Role_PronounsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Role_PronounsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_role_pronouns(inputs)
	return es_intake_forms_config_role_pronouns(inputs)
});