/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Twofa_Vol_DescInputs */

const en_onboarding_twofa_vol_desc = /** @type {(inputs: Onboarding_Twofa_Vol_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Before accessing the dashboard, set up a second verification method. This protects both you and the people you serve.`)
};

const es_onboarding_twofa_vol_desc = /** @type {(inputs: Onboarding_Twofa_Vol_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Antes de acceder al panel, configura un segundo metodo de verificacion. Esto te protege a ti y a las personas que atiendes.`)
};

/**
* | output |
* | --- |
* | "Before accessing the dashboard, set up a second verification method. This protects both you and the people you serve." |
*
* @param {Onboarding_Twofa_Vol_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_vol_desc = /** @type {((inputs?: Onboarding_Twofa_Vol_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Twofa_Vol_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_twofa_vol_desc(inputs)
	return es_onboarding_twofa_vol_desc(inputs)
});