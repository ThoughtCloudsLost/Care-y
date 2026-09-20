/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Closes_At_LabelInputs */

const en_intake_forms_closes_at_label = /** @type {(inputs: Intake_Forms_Closes_At_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Closes at`)
};

const es_intake_forms_closes_at_label = /** @type {(inputs: Intake_Forms_Closes_At_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cierra el`)
};

const en_xa2_intake_forms_closes_at_label = /** @type {(inputs: Intake_Forms_Closes_At_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clòsès àt •••⟧`)
};

/**
* | output |
* | --- |
* | "Closes at" |
*
* @param {Intake_Forms_Closes_At_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_closes_at_label = /** @type {((inputs?: Intake_Forms_Closes_At_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Closes_At_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_closes_at_label(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_closes_at_label(inputs)
	return en_intake_forms_closes_at_label(inputs)
});