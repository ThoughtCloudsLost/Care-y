/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_SavingInputs */

const en_library_saving = /** @type {(inputs: Library_SavingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saving...`)
};

const es_library_saving = /** @type {(inputs: Library_SavingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardando...`)
};

const en_xa2_library_saving = /** @type {(inputs: Library_SavingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvìng... •••⟧`)
};

/**
* | output |
* | --- |
* | "Saving..." |
*
* @param {Library_SavingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_saving = /** @type {((inputs?: Library_SavingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_SavingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_saving(inputs)
	if (locale === "en-XA") return en_xa2_library_saving(inputs)
	return en_library_saving(inputs)
});