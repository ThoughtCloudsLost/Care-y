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

const en_xa2_intake_forms_config_allow_recurring = /** @type {(inputs: Intake_Forms_Config_Allow_RecurringInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àllòw wèèkly tìmès ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Allow weekly times" |
*
* @param {Intake_Forms_Config_Allow_RecurringInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_allow_recurring = /** @type {((inputs?: Intake_Forms_Config_Allow_RecurringInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Allow_RecurringInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_allow_recurring(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_allow_recurring(inputs)
	return en_intake_forms_config_allow_recurring(inputs)
});