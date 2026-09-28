/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Password_HeadingInputs */

const en_onboarding_password_heading = /** @type {(inputs: Onboarding_Password_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose Your Own Password`)
};

const es_onboarding_password_heading = /** @type {(inputs: Onboarding_Password_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elige tu propia contraseña`)
};

const en_xa2_onboarding_password_heading = /** @type {(inputs: Onboarding_Password_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chòòsè Yòùr Òwn Pàsswòrd ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Choose Your Own Password" |
*
* @param {Onboarding_Password_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_password_heading = /** @type {((inputs?: Onboarding_Password_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Password_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_password_heading(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_password_heading(inputs)
	return en_onboarding_password_heading(inputs)
});