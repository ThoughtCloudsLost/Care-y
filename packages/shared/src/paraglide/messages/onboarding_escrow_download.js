/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_DownloadInputs */

const en_onboarding_escrow_download = /** @type {(inputs: Onboarding_Escrow_DownloadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Download Escrow File`)
};

const es_onboarding_escrow_download = /** @type {(inputs: Onboarding_Escrow_DownloadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descargar archivo de custodia`)
};

/**
* | output |
* | --- |
* | "Download Escrow File" |
*
* @param {Onboarding_Escrow_DownloadInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_download = /** @type {((inputs?: Onboarding_Escrow_DownloadInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_DownloadInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_download(inputs)
	return es_onboarding_escrow_download(inputs)
});