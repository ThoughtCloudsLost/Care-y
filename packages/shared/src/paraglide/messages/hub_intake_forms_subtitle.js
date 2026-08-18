/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Intake_Forms_SubtitleInputs */

const en_hub_intake_forms_subtitle = /** @type {(inputs: Hub_Intake_Forms_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Customize the public intake page fields`)
};

const es_hub_intake_forms_subtitle = /** @type {(inputs: Hub_Intake_Forms_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Personaliza los campos de la pagina publica de admision`)
};

/**
* | output |
* | --- |
* | "Customize the public intake page fields" |
*
* @param {Hub_Intake_Forms_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_intake_forms_subtitle = /** @type {((inputs?: Hub_Intake_Forms_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Intake_Forms_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_hub_intake_forms_subtitle(inputs)
	return es_hub_intake_forms_subtitle(inputs)
});