/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Firstlogin_SigninInputs */

const en_onboarding_firstlogin_signin = /** @type {(inputs: Onboarding_Firstlogin_SigninInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign In`)
};

const es_onboarding_firstlogin_signin = /** @type {(inputs: Onboarding_Firstlogin_SigninInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Iniciar sesión`)
};

const en_xa2_onboarding_firstlogin_signin = /** @type {(inputs: Onboarding_Firstlogin_SigninInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sìgn Ìn •••⟧`)
};

/**
* | output |
* | --- |
* | "Sign In" |
*
* @param {Onboarding_Firstlogin_SigninInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_signin = /** @type {((inputs?: Onboarding_Firstlogin_SigninInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_SigninInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_firstlogin_signin(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_firstlogin_signin(inputs)
	return en_onboarding_firstlogin_signin(inputs)
});