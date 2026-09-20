/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_Section_TitleInputs */

const en_escalation_section_title = /** @type {(inputs: Escalation_Section_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escalation alerts`)
};

const es_escalation_section_title = /** @type {(inputs: Escalation_Section_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alertas de escalamiento`)
};

const en_xa2_escalation_section_title = /** @type {(inputs: Escalation_Section_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èscàlàtìòn àlèrts ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Escalation alerts" |
*
* @param {Escalation_Section_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_section_title = /** @type {((inputs?: Escalation_Section_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Section_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_escalation_section_title(inputs)
	if (locale === "en-XA") return en_xa2_escalation_section_title(inputs)
	return en_escalation_section_title(inputs)
});