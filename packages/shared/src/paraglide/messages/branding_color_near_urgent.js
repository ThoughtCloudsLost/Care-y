/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteers: NonNullable<unknown>, tickets: NonNullable<unknown> }} Branding_Color_Near_UrgentInputs */

const en_branding_color_near_urgent = /** @type {(inputs: Branding_Color_Near_UrgentInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This shade sits close to the red ${i?.volunteers} see on urgent ${i?.tickets}. The suggested shade keeps your identity and their signal apart.`)
};

const es_branding_color_near_urgent = /** @type {(inputs: Branding_Color_Near_UrgentInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Este tono queda cerca del rojo que ven ${i?.volunteers} en ${i?.tickets} urgentes. El tono sugerido mantiene tu identidad y esa señal separadas.`)
};

const en_xa2_branding_color_near_urgent = /** @type {(inputs: Branding_Color_Near_UrgentInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thìs shàdè sìts clòsè tò thè rèd  ••••••••••${i?.volunteers} sèè òn ùrgènt  •••••${i?.tickets}. Thè sùggèstèd shàdè kèèps yòùr ìdèntìty ànd thèìr sìgnàl àpàrt. ••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This shade sits close to the red {volunteers} see on urgent {tickets}. The suggested shade keeps your identity and their signal apart." |
*
* @param {Branding_Color_Near_UrgentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const branding_color_near_urgent = /** @type {((inputs: Branding_Color_Near_UrgentInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Branding_Color_Near_UrgentInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_branding_color_near_urgent(inputs)
	if (locale === "en-XA") return en_xa2_branding_color_near_urgent(inputs)
	return en_branding_color_near_urgent(inputs)
});