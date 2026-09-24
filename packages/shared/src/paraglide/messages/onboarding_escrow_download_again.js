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

const en_xa2_onboarding_escrow_download_again = /** @type {(inputs: Onboarding_Escrow_Download_AgainInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dòwnlòàd Àgàìn •••••⟧`)
};

/**
* | output |
* | --- |
* | "Download Again" |
*
* @param {Onboarding_Escrow_Download_AgainInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_download_again = /** @type {((inputs?: Onboarding_Escrow_Download_AgainInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Download_AgainInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_escrow_download_again(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_escrow_download_again(inputs)
	return en_onboarding_escrow_download_again(inputs)
});