/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Role_Contact_SafetyInputs */

const en_intake_forms_config_role_contact_safety = /** @type {(inputs: Intake_Forms_Config_Role_Contact_SafetyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contact safety`)
};

const es_intake_forms_config_role_contact_safety = /** @type {(inputs: Intake_Forms_Config_Role_Contact_SafetyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seguridad de contacto`)
};

/**
* | output |
* | --- |
* | "Contact safety" |
*
* @param {Intake_Forms_Config_Role_Contact_SafetyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_contact_safety = /** @type {((inputs?: Intake_Forms_Config_Role_Contact_SafetyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Role_Contact_SafetyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_role_contact_safety(inputs)
	return es_intake_forms_config_role_contact_safety(inputs)
});