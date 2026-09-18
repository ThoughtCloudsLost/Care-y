/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Form_Locales_BodyInputs */

const en_demo_narrative_admin_form_locales_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Locales_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The completeness count for each locale tracks how many translatable items have been filled out of the total, and the total counts only items that exist in at least one locale, so it grows as the form is authored. Help text counts only when it has been written somewhere, while a field label always counts because it is always required.
**Fallback.** A field left blank in a translated locale uses the base language instead, so a form with partial translations still renders completely.
**Preview.** The preview pane has its own locale switcher, independent of the editor's, so one language can be edited while previewing another.`)
};

const es_demo_narrative_admin_form_locales_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Locales_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El conteo de completitud de cada idioma registra cuántos elementos traducibles se han completado del total, y el total solo cuenta elementos que existen en al menos un idioma, de modo que crece a medida que se crea el formulario. El texto de ayuda solo cuenta cuando se ha escrito en algún lugar, mientras que la etiqueta de campo siempre cuenta porque siempre es obligatoria.
**Alternativa.** Un campo dejado en blanco en un idioma traducido usa el idioma base en su lugar, de modo que un formulario con traducciones parciales se muestra completo.
**Vista previa.** El panel de vista previa tiene su propio selector de idioma, independiente del editor, de modo que se puede editar en un idioma mientras se previsualiza en otro.`)
};

/**
* | output |
* | --- |
* | "The completeness count for each locale tracks how many translatable items have been filled out of the total, and the total counts only items that exist in at..." |
*
* @param {Demo_Narrative_Admin_Form_Locales_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_locales_body = /** @type {((inputs?: Demo_Narrative_Admin_Form_Locales_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Form_Locales_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_form_locales_body(inputs)
	return en_demo_narrative_admin_form_locales_body(inputs)
});