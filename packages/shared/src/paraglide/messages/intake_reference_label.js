/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Reference_LabelInputs */

const en_intake_reference_label = /** @type {(inputs: Intake_Reference_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your reference code:`)
};

const es_intake_reference_label = /** @type {(inputs: Intake_Reference_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu código de referencia:`)
};

const en_xa2_intake_reference_label = /** @type {(inputs: Intake_Reference_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr rèfèrèncè còdè: ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your reference code:" |
*
* @param {Intake_Reference_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_reference_label = /** @type {((inputs?: Intake_Reference_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Reference_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_reference_label(inputs)
	if (locale === "en-XA") return en_xa2_intake_reference_label(inputs)
	return en_intake_reference_label(inputs)
});