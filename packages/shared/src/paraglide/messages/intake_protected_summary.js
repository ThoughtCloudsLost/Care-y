/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Protected_SummaryInputs */

const en_intake_protected_summary = /** @type {(inputs: Intake_Protected_SummaryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The organization can open it until someone takes your case. After that, only your case volunteers can.`)
};

const es_intake_protected_summary = /** @type {(inputs: Intake_Protected_SummaryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La organización puede abrirlo hasta que alguien tome tu caso. Después, solo los voluntarios de tu caso pueden hacerlo.`)
};

/**
* | output |
* | --- |
* | "The organization can open it until someone takes your case. After that, only your case volunteers can." |
*
* @param {Intake_Protected_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_protected_summary = /** @type {((inputs?: Intake_Protected_SummaryInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Protected_SummaryInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_protected_summary(inputs)
	return en_intake_protected_summary(inputs)
});