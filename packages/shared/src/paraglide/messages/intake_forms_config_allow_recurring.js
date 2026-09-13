/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Allow_RecurringInputs */

const en_intake_forms_config_allow_recurring = /** @type {(inputs: Intake_Forms_Config_Allow_RecurringInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Allow weekly times`)
};

const es_intake_forms_config_allow_recurring = /** @type {(inputs: Intake_Forms_Config_Allow_RecurringInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Permitir horarios semanales`)
};

/**
* | output |
* | --- |
* | "Allow weekly times" |
*
* @param {Intake_Forms_Config_Allow_RecurringInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_allow_recurring = /** @type {((inputs?: Intake_Forms_Config_Allow_RecurringInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Allow_RecurringInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_allow_recurring(inputs)
	return es_intake_forms_config_allow_recurring(inputs)
});