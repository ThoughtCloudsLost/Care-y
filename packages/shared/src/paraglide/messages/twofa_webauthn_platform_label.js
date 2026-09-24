/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Webauthn_Platform_LabelInputs */

const en_twofa_webauthn_platform_label = /** @type {(inputs: Twofa_Webauthn_Platform_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Screen lock verification`)
};

const es_twofa_webauthn_platform_label = /** @type {(inputs: Twofa_Webauthn_Platform_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verificación por bloqueo de pantalla`)
};

const en_xa2_twofa_webauthn_platform_label = /** @type {(inputs: Twofa_Webauthn_Platform_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Scrèèn lòck vèrìfìcàtìòn ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Screen lock verification" |
*
* @param {Twofa_Webauthn_Platform_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_webauthn_platform_label = /** @type {((inputs?: Twofa_Webauthn_Platform_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Webauthn_Platform_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_webauthn_platform_label(inputs)
	if (locale === "en-XA") return en_xa2_twofa_webauthn_platform_label(inputs)
	return en_twofa_webauthn_platform_label(inputs)
});