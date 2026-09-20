/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Download_Again_TitleInputs */

const en_onboarding_escrow_download_again_title = /** @type {(inputs: Onboarding_Escrow_Download_Again_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generate a new escrow file?`)
};

const es_onboarding_escrow_download_again_title = /** @type {(inputs: Onboarding_Escrow_Download_Again_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Generar un nuevo archivo de custodia?`)
};

const en_xa2_onboarding_escrow_download_again_title = /** @type {(inputs: Onboarding_Escrow_Download_Again_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Gènèràtè à nèw èscròw fìlè? •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Generate a new escrow file?" |
*
* @param {Onboarding_Escrow_Download_Again_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_download_again_title = /** @type {((inputs?: Onboarding_Escrow_Download_Again_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Download_Again_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_escrow_download_again_title(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_escrow_download_again_title(inputs)
	return en_onboarding_escrow_download_again_title(inputs)
});