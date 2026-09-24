/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Https_WarningInputs */

const en_onboarding_escrow_https_warning = /** @type {(inputs: Onboarding_Escrow_Https_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escrow export requires a secure connection. Please access this page over HTTPS.`)
};

const es_onboarding_escrow_https_warning = /** @type {(inputs: Onboarding_Escrow_Https_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La exportación de custodia requiere una conexión segura. Acceda a esta página a traves de HTTPS.`)
};

const en_xa2_onboarding_escrow_https_warning = /** @type {(inputs: Onboarding_Escrow_Https_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èscròw èxpòrt rèqùìrès à sècùrè cònnèctìòn. Plèàsè àccèss thìs pàgè òvèr HTTPS. ••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Escrow export requires a secure connection. Please access this page over HTTPS." |
*
* @param {Onboarding_Escrow_Https_WarningInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_https_warning = /** @type {((inputs?: Onboarding_Escrow_Https_WarningInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Https_WarningInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_escrow_https_warning(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_escrow_https_warning(inputs)
	return en_onboarding_escrow_https_warning(inputs)
});