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

/**
* | output |
* | --- |
* | "Remove banner" |
*
* @param {Intake_Forms_Banner_RemoveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_remove = /** @type {((inputs?: Intake_Forms_Banner_RemoveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Banner_RemoveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_banner_remove(inputs)
	return es_intake_forms_banner_remove(inputs)
});