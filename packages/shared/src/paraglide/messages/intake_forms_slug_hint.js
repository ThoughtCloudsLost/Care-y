/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Slug_HintInputs */

const en_intake_forms_slug_hint = /** @type {(inputs: Intake_Forms_Slug_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Used in the shareable URL. Lowercase letters, numbers, and hyphens only.`)
};

const es_intake_forms_slug_hint = /** @type {(inputs: Intake_Forms_Slug_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se usa en la URL para compartir. Solo letras minúsculas, números y guiones.`)
};

const en_xa2_intake_forms_slug_hint = /** @type {(inputs: Intake_Forms_Slug_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùsèd ìn thè shàrèàblè ÙRL. Lòwèrcàsè lèttèrs, nùmbèrs, ànd hyphèns ònly. ••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Used in the shareable URL. Lowercase letters, numbers, and hyphens only." |
*
* @param {Intake_Forms_Slug_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_slug_hint = /** @type {((inputs?: Intake_Forms_Slug_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Slug_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_slug_hint(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_slug_hint(inputs)
	return en_intake_forms_slug_hint(inputs)
});