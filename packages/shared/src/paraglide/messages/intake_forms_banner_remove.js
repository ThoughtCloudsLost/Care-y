/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Banner_RemoveInputs */

const en_intake_forms_banner_remove = /** @type {(inputs: Intake_Forms_Banner_RemoveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove banner`)
};

const es_intake_forms_banner_remove = /** @type {(inputs: Intake_Forms_Banner_RemoveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar portada`)
};

const en_xa2_intake_forms_banner_remove = /** @type {(inputs: Intake_Forms_Banner_RemoveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèmòvè bànnèr ••••⟧`)
};

/**
* | output |
* | --- |
* | "Remove banner" |
*
* @param {Intake_Forms_Banner_RemoveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_remove = /** @type {((inputs?: Intake_Forms_Banner_RemoveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Banner_RemoveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_banner_remove(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_banner_remove(inputs)
	return en_intake_forms_banner_remove(inputs)
});