/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Https_WarningInputs */

const en_onboarding_escrow_https_warning = /** @type {(inputs: Onboarding_Escrow_Https_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escrow export requires a secure connection. Please access this page over HTTPS.`)
};

const es_onboarding_escrow_https_warning = /** @type {(inputs: Onboarding_Escrow_Https_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La exportacion de custodia requiere una conexion segura. Acceda a esta pagina a traves de HTTPS.`)
};

/**
* | output |
* | --- |
* | "Escrow export requires a secure connection. Please access this page over HTTPS." |
*
* @param {Onboarding_Escrow_Https_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_https_warning = /** @type {((inputs?: Onboarding_Escrow_Https_WarningInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Https_WarningInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_https_warning(inputs)
	return es_onboarding_escrow_https_warning(inputs)
});