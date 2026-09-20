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

const en_xa2_consultant_phone_preference_saved = /** @type {(inputs: Consultant_Phone_Preference_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càll prèfèrèncè sàvèd •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Call preference saved" |
*
* @param {Consultant_Phone_Preference_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_preference_saved = /** @type {((inputs?: Consultant_Phone_Preference_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Preference_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_consultant_phone_preference_saved(inputs)
	if (locale === "en-XA") return en_xa2_consultant_phone_preference_saved(inputs)
	return en_consultant_phone_preference_saved(inputs)
});