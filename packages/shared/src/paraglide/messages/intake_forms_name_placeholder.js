/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Name_PlaceholderInputs */

const en_intake_forms_name_placeholder = /** @type {(inputs: Intake_Forms_Name_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`e.g. Main Intake`)
};

const es_intake_forms_name_placeholder = /** @type {(inputs: Intake_Forms_Name_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ej. Admision principal`)
};

/**
* | output |
* | --- |
* | "e.g. Main Intake" |
*
* @param {Intake_Forms_Name_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_name_placeholder = /** @type {((inputs?: Intake_Forms_Name_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Name_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_name_placeholder(inputs)
	return es_intake_forms_name_placeholder(inputs)
});