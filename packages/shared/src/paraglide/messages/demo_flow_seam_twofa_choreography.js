/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Seam_Twofa_ChoreographyInputs */

const en_demo_flow_seam_twofa_choreography = /** @type {(inputs: Demo_Flow_Seam_Twofa_ChoreographyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The second factor check is choreographed in this demo. The installed app verifies the code against the server.`)
};

const es_demo_flow_seam_twofa_choreography = /** @type {(inputs: Demo_Flow_Seam_Twofa_ChoreographyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La comprobación del segundo factor está recreada en este demo. La aplicación instalada verifica el código contra el servidor.`)
};

/**
* | output |
* | --- |
* | "The second factor check is choreographed in this demo. The installed app verifies the code against the server." |
*
* @param {Demo_Flow_Seam_Twofa_ChoreographyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_seam_twofa_choreography = /** @type {((inputs?: Demo_Flow_Seam_Twofa_ChoreographyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Seam_Twofa_ChoreographyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_seam_twofa_choreography(inputs)
	return es_demo_flow_seam_twofa_choreography(inputs)
});