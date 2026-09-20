/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Banner_AddInputs */

const en_intake_forms_banner_add = /** @type {(inputs: Intake_Forms_Banner_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add banner image`)
};

const es_intake_forms_banner_add = /** @type {(inputs: Intake_Forms_Banner_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar imagen de portada`)
};

const en_xa2_intake_forms_banner_add = /** @type {(inputs: Intake_Forms_Banner_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd bànnèr ìmàgè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Add banner image" |
*
* @param {Intake_Forms_Banner_AddInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_add = /** @type {((inputs?: Intake_Forms_Banner_AddInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Banner_AddInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_banner_add(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_banner_add(inputs)
	return en_intake_forms_banner_add(inputs)
});