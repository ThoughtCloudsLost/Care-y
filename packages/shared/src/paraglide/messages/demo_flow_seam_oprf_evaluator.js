/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Seam_Oprf_EvaluatorInputs */

const en_demo_flow_seam_oprf_evaluator = /** @type {(inputs: Demo_Flow_Seam_Oprf_EvaluatorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This demo runs a single scalar OPRF evaluator in the browser. In production the OPRF key is split across two servers in separate jurisdictions, and neither one can evaluate on its own.`)
};

const es_demo_flow_seam_oprf_evaluator = /** @type {(inputs: Demo_Flow_Seam_Oprf_EvaluatorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este demo ejecuta un evaluador OPRF de un solo escalar en el navegador. En producción la clave OPRF se reparte entre dos servidores en jurisdicciones distintas, y ninguno puede evaluarla por su cuenta.`)
};

/**
* | output |
* | --- |
* | "This demo runs a single scalar OPRF evaluator in the browser. In production the OPRF key is split across two servers in separate jurisdictions, and neither o..." |
*
* @param {Demo_Flow_Seam_Oprf_EvaluatorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_seam_oprf_evaluator = /** @type {((inputs?: Demo_Flow_Seam_Oprf_EvaluatorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Seam_Oprf_EvaluatorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_seam_oprf_evaluator(inputs)
	return es_demo_flow_seam_oprf_evaluator(inputs)
});