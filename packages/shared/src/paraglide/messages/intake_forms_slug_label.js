/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Slug_LabelInputs */

const en_intake_forms_slug_label = /** @type {(inputs: Intake_Forms_Slug_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Link name`)
};

const es_intake_forms_slug_label = /** @type {(inputs: Intake_Forms_Slug_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre del enlace`)
};

/**
* | output |
* | --- |
* | "Link name" |
*
* @param {Intake_Forms_Slug_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_slug_label = /** @type {((inputs?: Intake_Forms_Slug_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Slug_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_slug_label(inputs)
	return es_intake_forms_slug_label(inputs)
});