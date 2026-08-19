/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Role_UrgencyInputs */

const en_intake_forms_config_role_urgency = /** @type {(inputs: Intake_Forms_Config_Role_UrgencyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Urgency`)
};

const es_intake_forms_config_role_urgency = /** @type {(inputs: Intake_Forms_Config_Role_UrgencyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Urgencia`)
};

/**
* | output |
* | --- |
* | "Urgency" |
*
* @param {Intake_Forms_Config_Role_UrgencyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_urgency = /** @type {((inputs?: Intake_Forms_Config_Role_UrgencyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Role_UrgencyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_role_urgency(inputs)
	return es_intake_forms_config_role_urgency(inputs)
});