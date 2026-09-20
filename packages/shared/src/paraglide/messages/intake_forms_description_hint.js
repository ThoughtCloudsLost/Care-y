/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Description_HintInputs */

const en_intake_forms_description_hint = /** @type {(inputs: Intake_Forms_Description_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shown on the public form page.`)
};

const es_intake_forms_description_hint = /** @type {(inputs: Intake_Forms_Description_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se muestra en la página pública del formulario.`)
};

const en_xa2_intake_forms_description_hint = /** @type {(inputs: Intake_Forms_Description_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Shòwn òn thè pùblìc fòrm pàgè. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Shown on the public form page." |
*
* @param {Intake_Forms_Description_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_description_hint = /** @type {((inputs?: Intake_Forms_Description_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Description_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_description_hint(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_description_hint(inputs)
	return en_intake_forms_description_hint(inputs)
});