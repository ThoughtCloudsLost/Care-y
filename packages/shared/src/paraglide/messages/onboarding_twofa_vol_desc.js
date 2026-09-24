/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Twofa_Vol_DescInputs */

const en_onboarding_twofa_vol_desc = /** @type {(inputs: Onboarding_Twofa_Vol_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Before accessing the Overview, set up a second verification method. This protects both you and the people you serve.`)
};

const es_onboarding_twofa_vol_desc = /** @type {(inputs: Onboarding_Twofa_Vol_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Antes de acceder al Resumen, configura un segundo método de verificación. Esto te protege a ti y a las personas que atiendes.`)
};

const en_xa2_onboarding_twofa_vol_desc = /** @type {(inputs: Onboarding_Twofa_Vol_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bèfòrè àccèssìng thè Òvèrvìèw, sèt ùp à sècònd vèrìfìcàtìòn mèthòd. Thìs pròtècts bòth yòù ànd thè pèòplè yòù sèrvè. •••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Before accessing the Overview, set up a second verification method. This protects both you and the people you serve." |
*
* @param {Onboarding_Twofa_Vol_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_vol_desc = /** @type {((inputs?: Onboarding_Twofa_Vol_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Twofa_Vol_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_twofa_vol_desc(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_twofa_vol_desc(inputs)
	return en_onboarding_twofa_vol_desc(inputs)
});