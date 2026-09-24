/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Banner_Alt_PlaceholderInputs */

const en_intake_forms_banner_alt_placeholder = /** @type {(inputs: Intake_Forms_Banner_Alt_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Describe the image for screen readers`)
};

const es_intake_forms_banner_alt_placeholder = /** @type {(inputs: Intake_Forms_Banner_Alt_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Describe la imagen para lectores de pantalla`)
};

const en_xa2_intake_forms_banner_alt_placeholder = /** @type {(inputs: Intake_Forms_Banner_Alt_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèscrìbè thè ìmàgè fòr scrèèn rèàdèrs ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Describe the image for screen readers" |
*
* @param {Intake_Forms_Banner_Alt_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_alt_placeholder = /** @type {((inputs?: Intake_Forms_Banner_Alt_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Banner_Alt_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_banner_alt_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_banner_alt_placeholder(inputs)
	return en_intake_forms_banner_alt_placeholder(inputs)
});