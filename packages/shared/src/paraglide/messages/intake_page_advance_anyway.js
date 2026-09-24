/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Page_Advance_AnywayInputs */

const en_intake_page_advance_anyway = /** @type {(inputs: Intake_Page_Advance_AnywayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Continue with incomplete answers`)
};

const es_intake_page_advance_anyway = /** @type {(inputs: Intake_Page_Advance_AnywayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Continuar con respuestas incompletas`)
};

const en_xa2_intake_page_advance_anyway = /** @type {(inputs: Intake_Page_Advance_AnywayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còntìnùè wìth ìncòmplètè ànswèrs ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Continue with incomplete answers" |
*
* @param {Intake_Page_Advance_AnywayInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_page_advance_anyway = /** @type {((inputs?: Intake_Page_Advance_AnywayInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Page_Advance_AnywayInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_page_advance_anyway(inputs)
	if (locale === "en-XA") return en_xa2_intake_page_advance_anyway(inputs)
	return en_intake_page_advance_anyway(inputs)
});