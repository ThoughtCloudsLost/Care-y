/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Firstlogin_SigninInputs */

const en_onboarding_firstlogin_signin = /** @type {(inputs: Onboarding_Firstlogin_SigninInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign In`)
};

const es_onboarding_firstlogin_signin = /** @type {(inputs: Onboarding_Firstlogin_SigninInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Iniciar sesion`)
};

/**
* | output |
* | --- |
* | "Sign In" |
*
* @param {Onboarding_Firstlogin_SigninInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_signin = /** @type {((inputs?: Onboarding_Firstlogin_SigninInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_SigninInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_firstlogin_signin(inputs)
	return es_onboarding_firstlogin_signin(inputs)
});