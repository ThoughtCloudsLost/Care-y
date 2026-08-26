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

/**
* | output |
* | --- |
* | "Closes at" |
*
* @param {Intake_Forms_Closes_At_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_closes_at_label = /** @type {((inputs?: Intake_Forms_Closes_At_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Closes_At_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_closes_at_label(inputs)
	return es_intake_forms_closes_at_label(inputs)
});