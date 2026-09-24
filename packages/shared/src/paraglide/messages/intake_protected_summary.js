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

const en_xa2_intake_protected_summary = /** @type {(inputs: Intake_Protected_SummaryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè òrgànìzàtìòn càn òpèn ìt ùntìl sòmèònè tàkès yòùr càsè. Àftèr thàt, ònly yòùr càsè vòlùntèèrs càn. •••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The organization can open it until someone takes your case. After that, only your case volunteers can." |
*
* @param {Intake_Protected_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_protected_summary = /** @type {((inputs?: Intake_Protected_SummaryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Protected_SummaryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_protected_summary(inputs)
	if (locale === "en-XA") return en_xa2_intake_protected_summary(inputs)
	return en_intake_protected_summary(inputs)
});