/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Dashboard_DescInputs */

const en_demo_section_dashboard_desc = /** @type {(inputs: Demo_Section_Dashboard_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The home screen after sign-in. Collapsible cards show shift status, ticket counts per queue, recent activity, knowledge base updates, and merge candidates. All displayed data is decrypted locally in the browser.`)
};

const es_demo_section_dashboard_desc = /** @type {(inputs: Demo_Section_Dashboard_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La pantalla de inicio tras iniciar sesión. Tarjetas plegables muestran el estado del turno, conteos de tickets por cola, actividad reciente, novedades de la base de conocimiento y candidatos de fusión. Todos los datos mostrados se descifran localmente en el navegador.`)
};

const en_xa2_demo_section_dashboard_desc = /** @type {(inputs: Demo_Section_Dashboard_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè hòmè scrèèn àftèr sìgn-ìn. Còllàpsìblè càrds shòw shìft stàtùs, tìckèt còùnts pèr qùèùè, rècènt àctìvìty, knòwlèdgè bàsè ùpdàtès, ànd mèrgè càndìdàtès. Àll dìsplàyèd dàtà ìs dècryptèd lòcàlly ìn thè bròwsèr. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The home screen after sign-in. Collapsible cards show shift status, ticket counts per queue, recent activity, knowledge base updates, and merge candidates. A..." |
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