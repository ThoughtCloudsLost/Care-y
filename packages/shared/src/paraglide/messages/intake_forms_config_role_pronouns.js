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

const en_xa2_intake_forms_config_role_pronouns = /** @type {(inputs: Intake_Forms_Config_Role_PronounsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Prònòùns •••⟧`)
};

/**
* | output |
* | --- |
* | "Pronouns" |
*
* @param {Intake_Forms_Config_Role_PronounsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_pronouns = /** @type {((inputs?: Intake_Forms_Config_Role_PronounsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Role_PronounsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_role_pronouns(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_role_pronouns(inputs)
	return en_intake_forms_config_role_pronouns(inputs)
});