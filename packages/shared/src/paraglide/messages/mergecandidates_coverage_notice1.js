/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mergecandidates_Coverage_Notice1Inputs */

const en_mergecandidates_coverage_notice1 = /** @type {(inputs: Mergecandidates_Coverage_Notice1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This scan covers only clients whose tickets you can decrypt. Other volunteers may see different results.`)
};

const es_mergecandidates_coverage_notice1 = /** @type {(inputs: Mergecandidates_Coverage_Notice1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este análisis cubre solo los clientes cuyos tickets puedes descifrar. Otros voluntarios pueden ver resultados diferentes.`)
};

const en_xa2_mergecandidates_coverage_notice1 = /** @type {(inputs: Mergecandidates_Coverage_Notice1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs scàn còvèrs ònly clìènts whòsè tìckèts yòù càn dècrypt. Òthèr vòlùntèèrs mày sèè dìffèrènt rèsùlts. ••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This scan covers only clients whose tickets you can decrypt. Other volunteers may see different results." |
*
* @param {Mergecandidates_Coverage_Notice1Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
const mergecandidates_coverage_notice1 = /** @type {((inputs?: Mergecandidates_Coverage_Notice1Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mergecandidates_Coverage_Notice1Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_mergecandidates_coverage_notice1(inputs)
	if (locale === "en-XA") return en_xa2_mergecandidates_coverage_notice1(inputs)
	return en_mergecandidates_coverage_notice1(inputs)
});
export { mergecandidates_coverage_notice1 as "mergeCandidates_coverage_notice" }