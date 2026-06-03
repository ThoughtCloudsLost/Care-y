/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Twofa_DescInputs */

const en_onboarding_twofa_desc = /** @type {(inputs: Onboarding_Twofa_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add at least one verification method to protect your account. Even if your password is compromised, no one else can access the system without this second factor.`)
};

const es_onboarding_twofa_desc = /** @type {(inputs: Onboarding_Twofa_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agrega al menos un metodo de verificacion para proteger tu cuenta. Aunque tu contrasena se vea comprometida, nadie mas podra acceder al sistema sin este segundo factor.`)
};

/**
* | output |
* | --- |
* | "Add at least one verification method to protect your account. Even if your password is compromised, no one else can access the system without this second fac..." |
*
* @param {Onboarding_Twofa_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_desc = /** @type {((inputs?: Onboarding_Twofa_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Twofa_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_twofa_desc(inputs)
	return es_onboarding_twofa_desc(inputs)
});