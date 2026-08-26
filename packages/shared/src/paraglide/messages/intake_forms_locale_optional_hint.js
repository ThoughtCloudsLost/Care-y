/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Locale_Optional_HintInputs */

const en_intake_forms_locale_optional_hint = /** @type {(inputs: Intake_Forms_Locale_Optional_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Translations are optional. Fields without a translation fall back to the English text.`)
};

const es_intake_forms_locale_optional_hint = /** @type {(inputs: Intake_Forms_Locale_Optional_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las traducciones son opcionales. Los campos sin traduccion muestran el texto en ingles.`)
};

/**
* | output |
* | --- |
* | "Translations are optional. Fields without a translation fall back to the English text." |
*
* @param {Intake_Forms_Locale_Optional_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_locale_optional_hint = /** @type {((inputs?: Intake_Forms_Locale_Optional_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Locale_Optional_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_locale_optional_hint(inputs)
	return es_intake_forms_locale_optional_hint(inputs)
});