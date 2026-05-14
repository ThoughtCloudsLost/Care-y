/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Download_AgainInputs */

const en_onboarding_escrow_download_again = /** @type {(inputs: Onboarding_Escrow_Download_AgainInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Download Again`)
};

const es_onboarding_escrow_download_again = /** @type {(inputs: Onboarding_Escrow_Download_AgainInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descargar de nuevo`)
};

/**
* | output |
* | --- |
* | "Download Again" |
*
* @param {Onboarding_Escrow_Download_AgainInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_download_again = /** @type {((inputs?: Onboarding_Escrow_Download_AgainInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Download_AgainInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_download_again(inputs)
	return es_onboarding_escrow_download_again(inputs)
});