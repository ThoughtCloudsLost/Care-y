/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_EmptyInputs */

const en_intake_forms_empty = /** @type {(inputs: Intake_Forms_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No forms yet. Create one to customize the intake page.`)
};

const es_intake_forms_empty = /** @type {(inputs: Intake_Forms_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay formularios. Crea uno para personalizar la página de admisión.`)
};

const en_xa2_intake_forms_empty = /** @type {(inputs: Intake_Forms_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò fòrms yèt. Crèàtè ònè tò cùstòmìzè thè ìntàkè pàgè. •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No forms yet. Create one to customize the intake page." |
*
* @param {Intake_Forms_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_empty = /** @type {((inputs?: Intake_Forms_EmptyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_EmptyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_empty(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_empty(inputs)
	return en_intake_forms_empty(inputs)
});