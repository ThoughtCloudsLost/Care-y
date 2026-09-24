/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Twofa_DescInputs */

const en_onboarding_twofa_desc = /** @type {(inputs: Onboarding_Twofa_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add at least one verification method to protect your account. Even if your password is compromised, no one else can access the system without this second factor.`)
};

const es_onboarding_twofa_desc = /** @type {(inputs: Onboarding_Twofa_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agrega al menos un método de verificación para proteger tu cuenta. Aunque tu contraseña se vea comprometida, nadie más podrá acceder al sistema sin este segundo factor.`)
};

const en_xa2_onboarding_twofa_desc = /** @type {(inputs: Onboarding_Twofa_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd àt lèàst ònè vèrìfìcàtìòn mèthòd tò pròtèct yòùr àccòùnt. Èvèn ìf yòùr pàsswòrd ìs còmpròmìsèd, nò ònè èlsè càn àccèss thè systèm wìthòùt thìs sècònd fàctòr. •••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Add at least one verification method to protect your account. Even if your password is compromised, no one else can access the system without this second fac..." |
*
* @param {Onboarding_Twofa_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_desc = /** @type {((inputs?: Onboarding_Twofa_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Twofa_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_twofa_desc(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_twofa_desc(inputs)
	return en_onboarding_twofa_desc(inputs)
});