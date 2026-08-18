/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Contact_Method_LabelInputs */

const en_intake_contact_method_label = /** @type {(inputs: Intake_Contact_Method_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`How should we reach you?`)
};

const es_intake_contact_method_label = /** @type {(inputs: Intake_Contact_Method_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Como quieres que te contactemos?`)
};

/**
* | output |
* | --- |
* | "How should we reach you?" |
*
* @param {Intake_Contact_Method_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_contact_method_label = /** @type {((inputs?: Intake_Contact_Method_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Contact_Method_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_contact_method_label(inputs)
	return es_intake_contact_method_label(inputs)
});