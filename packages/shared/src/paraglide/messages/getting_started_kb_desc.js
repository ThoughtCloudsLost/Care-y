/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteers: NonNullable<unknown> }} Getting_Started_Kb_DescInputs */

const en_getting_started_kb_desc = /** @type {(inputs: Getting_Started_Kb_DescInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Give ${i?.volunteers} quick-reference guides and protocols.`)
};

const es_getting_started_kb_desc = /** @type {(inputs: Getting_Started_Kb_DescInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Proporciona guías de referencia rápida y protocolos a los ${i?.volunteers}.`)
};

const en_xa2_getting_started_kb_desc = /** @type {(inputs: Getting_Started_Kb_DescInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Gìvè  ••${i?.volunteers} qùìck-rèfèrèncè gùìdès ànd pròtòcòls. ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Give {volunteers} quick-reference guides and protocols." |
*
* @param {Getting_Started_Kb_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_kb_desc = /** @type {((inputs: Getting_Started_Kb_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_Kb_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_getting_started_kb_desc(inputs)
	if (locale === "en-XA") return en_xa2_getting_started_kb_desc(inputs)
	return en_getting_started_kb_desc(inputs)
});