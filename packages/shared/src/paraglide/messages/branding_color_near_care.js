/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteers: NonNullable<unknown>, tickets: NonNullable<unknown> }} Branding_Color_Near_CareInputs */

const en_branding_color_near_care = /** @type {(inputs: Branding_Color_Near_CareInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This shade sits close to the ochre ${i?.volunteers} see on high-priority ${i?.tickets}. The suggested shade keeps your identity and their signal apart.`)
};

const es_branding_color_near_care = /** @type {(inputs: Branding_Color_Near_CareInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Este tono queda cerca del ocre que ven ${i?.volunteers} en ${i?.tickets} de prioridad alta. El tono sugerido mantiene tu identidad y esa señal separadas.`)
};

const en_xa2_branding_color_near_care = /** @type {(inputs: Branding_Color_Near_CareInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thìs shàdè sìts clòsè tò thè òchrè  •••••••••••${i?.volunteers} sèè òn hìgh-prìòrìty  •••••••${i?.tickets}. Thè sùggèstèd shàdè kèèps yòùr ìdèntìty ànd thèìr sìgnàl àpàrt. ••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This shade sits close to the ochre {volunteers} see on high-priority {tickets}. The suggested shade keeps your identity and their signal apart." |
*
* @param {Branding_Color_Near_CareInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const branding_color_near_care = /** @type {((inputs: Branding_Color_Near_CareInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Branding_Color_Near_CareInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_branding_color_near_care(inputs)
	if (locale === "en-XA") return en_xa2_branding_color_near_care(inputs)
	return en_branding_color_near_care(inputs)
});