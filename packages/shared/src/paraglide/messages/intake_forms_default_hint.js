/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Default_HintInputs */

const en_intake_forms_default_hint = /** @type {(inputs: Intake_Forms_Default_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shown at /intake when no specific form link is used.`)
};

const es_intake_forms_default_hint = /** @type {(inputs: Intake_Forms_Default_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se muestra en /intake cuando no se usa un enlace específico.`)
};

const en_xa2_intake_forms_default_hint = /** @type {(inputs: Intake_Forms_Default_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Shòwn àt /ìntàkè whèn nò spècìfìc fòrm lìnk ìs ùsèd. ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Shown at /intake when no specific form link is used." |
*
* @param {Intake_Forms_Default_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_default_hint = /** @type {((inputs?: Intake_Forms_Default_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Default_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_default_hint(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_default_hint(inputs)
	return en_intake_forms_default_hint(inputs)
});