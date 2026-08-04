/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_Unit_LabelInputs */

const en_escalation_unit_label = /** @type {(inputs: Escalation_Unit_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unit`)
};

const es_escalation_unit_label = /** @type {(inputs: Escalation_Unit_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unidad`)
};

/**
* | output |
* | --- |
* | "Unit" |
*
* @param {Escalation_Unit_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_unit_label = /** @type {((inputs?: Escalation_Unit_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Unit_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_escalation_unit_label(inputs)
	return es_escalation_unit_label(inputs)
});