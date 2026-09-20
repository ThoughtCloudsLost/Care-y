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

const en_xa2_intake_forms_config_role_urgency = /** @type {(inputs: Intake_Forms_Config_Role_UrgencyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùrgèncy •••⟧`)
};

/**
* | output |
* | --- |
* | "Urgency" |
*
* @param {Intake_Forms_Config_Role_UrgencyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_urgency = /** @type {((inputs?: Intake_Forms_Config_Role_UrgencyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Role_UrgencyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_role_urgency(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_role_urgency(inputs)
	return en_intake_forms_config_role_urgency(inputs)
});