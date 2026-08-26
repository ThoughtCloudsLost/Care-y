/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Locale_HeadingInputs */

const en_intake_forms_locale_heading = /** @type {(inputs: Intake_Forms_Locale_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Authoring language`)
};

const es_intake_forms_locale_heading = /** @type {(inputs: Intake_Forms_Locale_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Idioma de edicion`)
};

/**
* | output |
* | --- |
* | "Authoring language" |
*
* @param {Intake_Forms_Locale_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_locale_heading = /** @type {((inputs?: Intake_Forms_Locale_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Locale_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_locale_heading(inputs)
	return es_intake_forms_locale_heading(inputs)
});