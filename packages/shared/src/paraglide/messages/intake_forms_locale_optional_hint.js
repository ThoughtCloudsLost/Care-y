/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Locale_Optional_HintInputs */

const en_intake_forms_locale_optional_hint = /** @type {(inputs: Intake_Forms_Locale_Optional_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Translations are optional. Fields without a translation fall back to the English text.`)
};

const es_intake_forms_locale_optional_hint = /** @type {(inputs: Intake_Forms_Locale_Optional_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las traducciones son opcionales. Los campos sin traducción muestran el texto en inglés.`)
};

const en_xa2_intake_forms_locale_optional_hint = /** @type {(inputs: Intake_Forms_Locale_Optional_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Trànslàtìòns àrè òptìònàl. Fìèlds wìthòùt à trànslàtìòn fàll bàck tò thè Ènglìsh tèxt. ••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Translations are optional. Fields without a translation fall back to the English text." |
*
* @param {Intake_Forms_Locale_Optional_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_locale_optional_hint = /** @type {((inputs?: Intake_Forms_Locale_Optional_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Locale_Optional_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_locale_optional_hint(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_locale_optional_hint(inputs)
	return en_intake_forms_locale_optional_hint(inputs)
});