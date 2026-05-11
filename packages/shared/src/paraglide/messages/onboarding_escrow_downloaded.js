/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_DownloadedInputs */

const en_onboarding_escrow_downloaded = /** @type {(inputs: Onboarding_Escrow_DownloadedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escrow file downloaded. Store it safely.`)
};

const es_onboarding_escrow_downloaded = /** @type {(inputs: Onboarding_Escrow_DownloadedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Archivo de custodia descargado. Guardelo de forma segura.`)
};

/**
* | output |
* | --- |
* | "Escrow file downloaded. Store it safely." |
*
* @param {Onboarding_Escrow_DownloadedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_downloaded = /** @type {((inputs?: Onboarding_Escrow_DownloadedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_DownloadedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_downloaded(inputs)
	return es_onboarding_escrow_downloaded(inputs)
});