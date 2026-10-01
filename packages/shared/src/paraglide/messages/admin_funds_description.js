/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Funds_DescriptionInputs */

const en_admin_funds_description = /** @type {(inputs: Admin_Funds_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A fund holds money set aside for one purpose, such as gas cards or emergency housing. Names and amounts are encrypted before they leave this device.`)
};

const es_admin_funds_description = /** @type {(inputs: Admin_Funds_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un fondo guarda dinero reservado para un solo fin, como tarjetas de gasolina o vivienda de emergencia. Los nombres y los importes se cifran antes de salir de este dispositivo.`)
};

const en_xa2_admin_funds_description = /** @type {(inputs: Admin_Funds_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À fùnd hòlds mònèy sèt àsìdè fòr ònè pùrpòsè, sùch às gàs càrds òr èmèrgèncy hòùsìng. Nàmès ànd àmòùnts àrè èncryptèd bèfòrè thèy lèàvè thìs dèvìcè. •••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A fund holds money set aside for one purpose, such as gas cards or emergency housing. Names and amounts are encrypted before they leave this device." |
*
* @param {Admin_Funds_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_description = /** @type {((inputs?: Admin_Funds_DescriptionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Funds_DescriptionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_funds_description(inputs)
	if (locale === "en-XA") return en_xa2_admin_funds_description(inputs)
	return en_admin_funds_description(inputs)
});