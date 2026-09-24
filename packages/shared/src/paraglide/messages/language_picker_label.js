/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Language_Picker_LabelInputs */

const en_language_picker_label = /** @type {(inputs: Language_Picker_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Language`)
};

const es_language_picker_label = /** @type {(inputs: Language_Picker_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Idioma`)
};

const en_xa2_language_picker_label = /** @type {(inputs: Language_Picker_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Làngùàgè •••⟧`)
};

/**
* | output |
* | --- |
* | "Language" |
*
* @param {Language_Picker_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const language_picker_label = /** @type {((inputs?: Language_Picker_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Language_Picker_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_language_picker_label(inputs)
	if (locale === "en-XA") return en_xa2_language_picker_label(inputs)
	return en_language_picker_label(inputs)
});