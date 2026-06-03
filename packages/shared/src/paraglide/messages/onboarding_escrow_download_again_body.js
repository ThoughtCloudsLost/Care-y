/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Download_Again_BodyInputs */

const en_onboarding_escrow_download_again_body = /** @type {(inputs: Onboarding_Escrow_Download_Again_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The previous escrow file is still valid. If you proceed, securely delete the old copy to minimize exposure of your backup key.`)
};

const es_onboarding_escrow_download_again_body = /** @type {(inputs: Onboarding_Escrow_Download_Again_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El archivo de custodia anterior sigue siendo valido. Si continua, elimine de forma segura la copia anterior para minimizar la exposicion de su clave de respaldo.`)
};

/**
* | output |
* | --- |
* | "The previous escrow file is still valid. If you proceed, securely delete the old copy to minimize exposure of your backup key." |
*
* @param {Onboarding_Escrow_Download_Again_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_download_again_body = /** @type {((inputs?: Onboarding_Escrow_Download_Again_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Download_Again_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_download_again_body(inputs)
	return es_onboarding_escrow_download_again_body(inputs)
});