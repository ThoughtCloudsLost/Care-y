/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Download_Again_BodyInputs */

const en_onboarding_escrow_download_again_body = /** @type {(inputs: Onboarding_Escrow_Download_Again_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The previous escrow file is still valid. If you proceed, securely delete the old copy to minimize exposure of your backup key.`)
};

const es_onboarding_escrow_download_again_body = /** @type {(inputs: Onboarding_Escrow_Download_Again_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El archivo de custodia anterior sigue siendo válido. Si continúa, elimine de forma segura la copia anterior para minimizar la exposición de su clave de respaldo.`)
};

const en_xa2_onboarding_escrow_download_again_body = /** @type {(inputs: Onboarding_Escrow_Download_Again_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè prèvìòùs èscròw fìlè ìs stìll vàlìd. Ìf yòù pròcèèd, sècùrèly dèlètè thè òld còpy tò mìnìmìzè èxpòsùrè òf yòùr bàckùp kèy. ••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The previous escrow file is still valid. If you proceed, securely delete the old copy to minimize exposure of your backup key." |
*
* @param {Onboarding_Escrow_Download_Again_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_download_again_body = /** @type {((inputs?: Onboarding_Escrow_Download_Again_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Download_Again_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_escrow_download_again_body(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_escrow_download_again_body(inputs)
	return en_onboarding_escrow_download_again_body(inputs)
});