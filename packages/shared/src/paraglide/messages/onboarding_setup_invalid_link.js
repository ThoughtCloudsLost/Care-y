/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Setup_Invalid_LinkInputs */

const en_onboarding_setup_invalid_link = /** @type {(inputs: Onboarding_Setup_Invalid_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This setup link is invalid or has already been used. If you need a new setup link, contact the platform operator.`)
};

const es_onboarding_setup_invalid_link = /** @type {(inputs: Onboarding_Setup_Invalid_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este enlace de configuración no es válido o ya fue utilizado. Si necesita un nuevo enlace, contacte al operador de la plataforma.`)
};

const en_xa2_onboarding_setup_invalid_link = /** @type {(inputs: Onboarding_Setup_Invalid_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs sètùp lìnk ìs ìnvàlìd òr hàs àlrèàdy bèèn ùsèd. Ìf yòù nèèd à nèw sètùp lìnk, còntàct thè plàtfòrm òpèràtòr. ••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This setup link is invalid or has already been used. If you need a new setup link, contact the platform operator." |
*
* @param {Onboarding_Setup_Invalid_LinkInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_setup_invalid_link = /** @type {((inputs?: Onboarding_Setup_Invalid_LinkInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Setup_Invalid_LinkInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_setup_invalid_link(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_setup_invalid_link(inputs)
	return en_onboarding_setup_invalid_link(inputs)
});