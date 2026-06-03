/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Download_Again_TitleInputs */

const en_onboarding_escrow_download_again_title = /** @type {(inputs: Onboarding_Escrow_Download_Again_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generate a new escrow file?`)
};

const es_onboarding_escrow_download_again_title = /** @type {(inputs: Onboarding_Escrow_Download_Again_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generar un nuevo archivo de custodia?`)
};

/**
* | output |
* | --- |
* | "Generate a new escrow file?" |
*
* @param {Onboarding_Escrow_Download_Again_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_download_again_title = /** @type {((inputs?: Onboarding_Escrow_Download_Again_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Download_Again_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_download_again_title(inputs)
	return es_onboarding_escrow_download_again_title(inputs)
});