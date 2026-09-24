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

const en_xa2_escalation_add_form_label = /** @type {(inputs: Escalation_Add_Form_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd èscàlàtìòn rùlè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Add escalation rule" |
*
* @param {Escalation_Add_Form_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_add_form_label = /** @type {((inputs?: Escalation_Add_Form_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Add_Form_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_escalation_add_form_label(inputs)
	if (locale === "en-XA") return en_xa2_escalation_add_form_label(inputs)
	return en_escalation_add_form_label(inputs)
});