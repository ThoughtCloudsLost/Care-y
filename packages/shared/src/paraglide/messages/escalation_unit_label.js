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

const en_xa2_escalation_unit_label = /** @type {(inputs: Escalation_Unit_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnìt ••⟧`)
};

/**
* | output |
* | --- |
* | "Unit" |
*
* @param {Escalation_Unit_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_unit_label = /** @type {((inputs?: Escalation_Unit_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Unit_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_escalation_unit_label(inputs)
	if (locale === "en-XA") return en_xa2_escalation_unit_label(inputs)
	return en_escalation_unit_label(inputs)
});