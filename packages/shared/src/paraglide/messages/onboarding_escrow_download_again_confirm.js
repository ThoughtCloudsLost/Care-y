/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Download_Again_ConfirmInputs */

const en_onboarding_escrow_download_again_confirm = /** @type {(inputs: Onboarding_Escrow_Download_Again_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Continue`)
};

const es_onboarding_escrow_download_again_confirm = /** @type {(inputs: Onboarding_Escrow_Download_Again_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Continuar`)
};

const en_xa2_onboarding_escrow_download_again_confirm = /** @type {(inputs: Onboarding_Escrow_Download_Again_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còntìnùè •••⟧`)
};

/**
* | output |
* | --- |
* | "Continue" |
*
* @param {Onboarding_Escrow_Download_Again_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_download_again_confirm = /** @type {((inputs?: Onboarding_Escrow_Download_Again_ConfirmInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Download_Again_ConfirmInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_escrow_download_again_confirm(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_escrow_download_again_confirm(inputs)
	return en_onboarding_escrow_download_again_confirm(inputs)
});