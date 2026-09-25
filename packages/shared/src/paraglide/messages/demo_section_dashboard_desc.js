/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Dashboard_DescInputs */

const en_demo_section_dashboard_desc = /** @type {(inputs: Demo_Section_Dashboard_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Surfaces the volunteer's shift status, queue counts, recent activity, knowledge base updates, and merge candidates. The browser decrypts all card data locally.`)
};

const es_demo_section_dashboard_desc = /** @type {(inputs: Demo_Section_Dashboard_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Muestra el estado del turno, los recuentos de cola, la actividad reciente, las actualizaciones de la base de conocimiento y los candidatos a fusionar. El navegador descifra todos los datos de las tarjetas de forma local.`)
};

const en_xa2_demo_section_dashboard_desc = /** @type {(inputs: Demo_Section_Dashboard_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sùrfàcès thè vòlùntèèr's shìft stàtùs, qùèùè còùnts, rècènt àctìvìty, knòwlèdgè bàsè ùpdàtès, ànd mèrgè càndìdàtès. Thè bròwsèr dècrypts àll càrd dàtà lòcàlly. ••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Surfaces the volunteer's shift status, queue counts, recent activity, knowledge base updates, and merge candidates. The browser decrypts all card data locally." |
*
* @param {Demo_Section_Dashboard_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_dashboard_desc = /** @type {((inputs?: Demo_Section_Dashboard_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Dashboard_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_dashboard_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_dashboard_desc(inputs)
	return en_demo_section_dashboard_desc(inputs)
});