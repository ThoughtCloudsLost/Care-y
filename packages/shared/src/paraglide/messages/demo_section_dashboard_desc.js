/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Dashboard_DescInputs */

const en_demo_section_dashboard_desc = /** @type {(inputs: Demo_Section_Dashboard_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Surfaces the user's shift status, queue counts, recent activity, knowledge base updates, and merge candidates above four ticket lanes (Needs attention, My tickets, Unassigned, On hold). Most sections can be filtered, and the filters are saved to the user's account encrypted so the server cannot read them. The screen updates live when tickets change. The browser decrypts names and titles locally; counts are plain numbers the server returns directly.`)
};

const es_demo_section_dashboard_desc = /** @type {(inputs: Demo_Section_Dashboard_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Muestra el estado del turno, los recuentos de cola, la actividad reciente, las actualizaciones de la base de conocimiento y los candidatos a fusionar sobre cuatro carriles de tickets (Necesitan atención, Mis tickets, Sin asignar y En espera). La mayoría de las secciones se pueden filtrar, y los filtros se guardan cifrados en la cuenta para que el servidor no pueda leerlos. La pantalla se actualiza en tiempo real cuando cambian los tickets. El navegador descifra nombres y títulos de forma local; los recuentos son números que el servidor devuelve directamente.`)
};

const en_xa2_demo_section_dashboard_desc = /** @type {(inputs: Demo_Section_Dashboard_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sùrfàcès thè ùsèr's shìft stàtùs, qùèùè còùnts, rècènt àctìvìty, knòwlèdgè bàsè ùpdàtès, ànd mèrgè càndìdàtès àbòvè fòùr tìckèt lànès (Nèèds àttèntìòn, My tìckèts, Ùnàssìgnèd, Òn hòld). Mòst sèctìòns càn bè fìltèrèd, ànd thè fìltèrs àrè sàvèd tò thè ùsèr's àccòùnt èncryptèd sò thè sèrvèr cànnòt rèàd thèm. Thè scrèèn ùpdàtès lìvè whèn tìckèts chàngè. Thè bròwsèr dècrypts nàmès ànd tìtlès lòcàlly; còùnts àrè plàìn nùmbèrs thè sèrvèr rètùrns dìrèctly. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Surfaces the user's shift status, queue counts, recent activity, knowledge base updates, and merge candidates above four ticket lanes (Needs attention, My ti..." |
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