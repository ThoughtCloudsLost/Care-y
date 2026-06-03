/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Setup_Invalid_LinkInputs */

const en_onboarding_setup_invalid_link = /** @type {(inputs: Onboarding_Setup_Invalid_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This setup link is invalid or has already been used. If you need a new setup link, contact the platform operator.`)
};

const es_onboarding_setup_invalid_link = /** @type {(inputs: Onboarding_Setup_Invalid_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este enlace de configuracion no es valido o ya fue utilizado. Si necesita un nuevo enlace, contacte al operador de la plataforma.`)
};

/**
* | output |
* | --- |
* | "This setup link is invalid or has already been used. If you need a new setup link, contact the platform operator." |
*
* @param {Onboarding_Setup_Invalid_LinkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_setup_invalid_link = /** @type {((inputs?: Onboarding_Setup_Invalid_LinkInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Setup_Invalid_LinkInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_setup_invalid_link(inputs)
	return es_onboarding_setup_invalid_link(inputs)
});