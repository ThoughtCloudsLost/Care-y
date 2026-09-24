/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_UnboundInputs */

const en_intake_forms_unbound = /** @type {(inputs: Intake_Forms_UnboundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Form unbound from queue`)
};

const es_intake_forms_unbound = /** @type {(inputs: Intake_Forms_UnboundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Formulario desvinculado de la cola`)
};

const en_xa2_intake_forms_unbound = /** @type {(inputs: Intake_Forms_UnboundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fòrm ùnbòùnd fròm qùèùè •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Form unbound from queue" |
*
* @param {Intake_Forms_UnboundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_unbound = /** @type {((inputs?: Intake_Forms_UnboundInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_UnboundInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_unbound(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_unbound(inputs)
	return en_intake_forms_unbound(inputs)
});