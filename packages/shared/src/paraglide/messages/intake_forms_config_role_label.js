/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Role_LabelInputs */

const en_intake_forms_config_role_label = /** @type {(inputs: Intake_Forms_Config_Role_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Field role`)
};

const es_intake_forms_config_role_label = /** @type {(inputs: Intake_Forms_Config_Role_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rol del campo`)
};

/**
* | output |
* | --- |
* | "Field role" |
*
* @param {Intake_Forms_Config_Role_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_label = /** @type {((inputs?: Intake_Forms_Config_Role_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Role_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_role_label(inputs)
	return es_intake_forms_config_role_label(inputs)
});