/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_Add_Form_LabelInputs */

const en_escalation_add_form_label = /** @type {(inputs: Escalation_Add_Form_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add escalation rule`)
};

const es_escalation_add_form_label = /** @type {(inputs: Escalation_Add_Form_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar regla de escalamiento`)
};

/**
* | output |
* | --- |
* | "Add escalation rule" |
*
* @param {Escalation_Add_Form_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_add_form_label = /** @type {((inputs?: Escalation_Add_Form_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Add_Form_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_escalation_add_form_label(inputs)
	return es_escalation_add_form_label(inputs)
});