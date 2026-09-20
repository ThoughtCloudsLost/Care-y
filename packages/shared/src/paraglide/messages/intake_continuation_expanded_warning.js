/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Continuation_Expanded_WarningInputs */

const en_intake_continuation_expanded_warning = /** @type {(inputs: Intake_Continuation_Expanded_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`If you lose this link, there is no way to recover it. Save it somewhere safe.`)
};

const es_intake_continuation_expanded_warning = /** @type {(inputs: Intake_Continuation_Expanded_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Si pierdes este enlace, no hay forma de recuperarlo. Guárdalo en un lugar seguro.`)
};

const en_xa2_intake_continuation_expanded_warning = /** @type {(inputs: Intake_Continuation_Expanded_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìf yòù lòsè thìs lìnk, thèrè ìs nò wày tò rècòvèr ìt. Sàvè ìt sòmèwhèrè sàfè. ••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "If you lose this link, there is no way to recover it. Save it somewhere safe." |
*
* @param {Intake_Continuation_Expanded_WarningInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_expanded_warning = /** @type {((inputs?: Intake_Continuation_Expanded_WarningInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Continuation_Expanded_WarningInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_continuation_expanded_warning(inputs)
	if (locale === "en-XA") return en_xa2_intake_continuation_expanded_warning(inputs)
	return en_intake_continuation_expanded_warning(inputs)
});