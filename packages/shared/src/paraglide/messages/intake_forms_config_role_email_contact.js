/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Role_Email_ContactInputs */

const en_intake_forms_config_role_email_contact = /** @type {(inputs: Intake_Forms_Config_Role_Email_ContactInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email contact`)
};

const es_intake_forms_config_role_email_contact = /** @type {(inputs: Intake_Forms_Config_Role_Email_ContactInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contacto por correo`)
};

/**
* | output |
* | --- |
* | "Email contact" |
*
* @param {Intake_Forms_Config_Role_Email_ContactInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_email_contact = /** @type {((inputs?: Intake_Forms_Config_Role_Email_ContactInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Role_Email_ContactInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_role_email_contact(inputs)
	return es_intake_forms_config_role_email_contact(inputs)
});