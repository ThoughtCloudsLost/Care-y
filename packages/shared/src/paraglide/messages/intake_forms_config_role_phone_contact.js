/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Role_Phone_ContactInputs */

const en_intake_forms_config_role_phone_contact = /** @type {(inputs: Intake_Forms_Config_Role_Phone_ContactInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone contact`)
};

const es_intake_forms_config_role_phone_contact = /** @type {(inputs: Intake_Forms_Config_Role_Phone_ContactInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contacto telefonico`)
};

/**
* | output |
* | --- |
* | "Phone contact" |
*
* @param {Intake_Forms_Config_Role_Phone_ContactInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_phone_contact = /** @type {((inputs?: Intake_Forms_Config_Role_Phone_ContactInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Role_Phone_ContactInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_role_phone_contact(inputs)
	return es_intake_forms_config_role_phone_contact(inputs)
});