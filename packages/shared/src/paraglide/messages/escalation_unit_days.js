/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_Unit_DaysInputs */

const en_escalation_unit_days = /** @type {(inputs: Escalation_Unit_DaysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Days`)
};

const es_escalation_unit_days = /** @type {(inputs: Escalation_Unit_DaysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Días`)
};

const en_xa2_escalation_unit_days = /** @type {(inputs: Escalation_Unit_DaysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dàys ••⟧`)
};

/**
* | output |
* | --- |
* | "Days" |
*
* @param {Escalation_Unit_DaysInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_unit_days = /** @type {((inputs?: Escalation_Unit_DaysInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Unit_DaysInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_escalation_unit_days(inputs)
	if (locale === "en-XA") return en_xa2_escalation_unit_days(inputs)
	return en_escalation_unit_days(inputs)
});