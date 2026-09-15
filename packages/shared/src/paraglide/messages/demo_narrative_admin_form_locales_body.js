/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Form_Locales_BodyInputs */

const en_demo_narrative_admin_form_locales_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Locales_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A segmented control above the editor lets administrators switch between the organization's supported languages while editing. The currently selected locale controls which language the field labels, help text, and form content editors show.
**Completeness badge.** Each locale button shows a count of how many translatable fields have been filled out of the total, so it is visible at a glance which languages need more work.
**Fallback hint.** When editing a locale other than the base language, a hint below the selector explains that translations are optional and the base language will be used for any field left blank.
**Preview.** The preview pane has its own locale switcher that is independent of the editor's. Changing the preview locale shows how the form will look to a visitor in that language.`)
};

const es_demo_narrative_admin_form_locales_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Locales_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un control segmentado sobre el editor permite a los administradores cambiar entre los idiomas soportados por la organización mientras editan. El idioma seleccionado controla qué idioma muestran los editores de etiquetas de campo, texto de ayuda y contenido del formulario.
**Insignia de completitud.** Cada botón de idioma muestra un conteo de cuántos campos traducibles se han completado del total, para que sea visible de un vistazo qué idiomas necesitan más trabajo.
**Idioma alternativo.** Cuando se edita un idioma distinto al idioma base, una indicación debajo del selector explica que las traducciones son opcionales y que se usará el idioma base para cualquier campo dejado en blanco.
**Vista previa.** El panel de vista previa tiene su propio selector de idioma independiente del editor. Cambiar el idioma de la vista previa muestra cómo se verá el formulario para un visitante en ese idioma.`)
};

/**
* | output |
* | --- |
* | "A segmented control above the editor lets administrators switch between the organization's supported languages while editing. The currently selected locale c..." |
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