/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Slug_PlaceholderInputs */

const en_intake_forms_slug_placeholder = /** @type {(inputs: Intake_Forms_Slug_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`e.g. crisis-line`)
};

const es_intake_forms_slug_placeholder = /** @type {(inputs: Intake_Forms_Slug_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ej. linea-de-crisis`)
};

/**
* | output |
* | --- |
* | "e.g. crisis-line" |
*
* @param {Intake_Forms_Slug_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_slug_placeholder = /** @type {((inputs?: Intake_Forms_Slug_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Slug_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_slug_placeholder(inputs)
	return es_intake_forms_slug_placeholder(inputs)
});