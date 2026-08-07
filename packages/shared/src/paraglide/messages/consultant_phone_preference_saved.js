/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Preference_SavedInputs */

const en_consultant_phone_preference_saved = /** @type {(inputs: Consultant_Phone_Preference_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call preference saved`)
};

const es_consultant_phone_preference_saved = /** @type {(inputs: Consultant_Phone_Preference_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preferencia de llamada guardada`)
};

/**
* | output |
* | --- |
* | "Call preference saved" |
*
* @param {Consultant_Phone_Preference_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_preference_saved = /** @type {((inputs?: Consultant_Phone_Preference_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Preference_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_preference_saved(inputs)
	return es_consultant_phone_preference_saved(inputs)
});