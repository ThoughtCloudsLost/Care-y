/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Seam_Twofa_ChoreographyInputs */

const en_demo_flow_seam_twofa_choreography = /** @type {(inputs: Demo_Flow_Seam_Twofa_ChoreographyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The second factor check is choreographed in the handbook. The installed app verifies the code against the server.`)
};

const es_demo_flow_seam_twofa_choreography = /** @type {(inputs: Demo_Flow_Seam_Twofa_ChoreographyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La comprobación del segundo factor está recreada en el manual. La aplicación instalada verifica el código contra el servidor.`)
};

const en_xa2_demo_flow_seam_twofa_choreography = /** @type {(inputs: Demo_Flow_Seam_Twofa_ChoreographyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè sècònd fàctòr chèck ìs chòrèògràphèd ìn thè hàndbòòk. Thè ìnstàllèd àpp vèrìfìès thè còdè àgàìnst thè sèrvèr. ••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The second factor check is choreographed in the handbook. The installed app verifies the code against the server." |
*
* @param {Demo_Flow_Seam_Twofa_ChoreographyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_seam_twofa_choreography = /** @type {((inputs?: Demo_Flow_Seam_Twofa_ChoreographyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Seam_Twofa_ChoreographyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_seam_twofa_choreography(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_seam_twofa_choreography(inputs)
	return en_demo_flow_seam_twofa_choreography(inputs)
});