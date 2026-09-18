/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Form_Preview_BodyInputs */

const en_demo_narrative_admin_form_preview_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Preview_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The preview renders the form using the same field renderer the public intake page uses, so the editing view matches what the visitor sees when submitting. When the form has page breaks, the preview shows the same page structure the visitor moves through, with forward and back navigation between pages.
**View modes.** The preview can show the active form, the confirmation after submission, and the closed message, and the confirmation and closed message each fall back to a default when the organization has not written one.
**When it is empty.** A form with no fields yet shows an empty state in the preview.`)
};

const es_demo_narrative_admin_form_preview_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Preview_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La vista previa renderiza el formulario usando el mismo componente de campos que usa la página pública de admisión, de modo que la vista de edición coincide con lo que ve el visitante al enviar. Cuando el formulario tiene saltos de página, la vista previa muestra la misma estructura de páginas que recorre el visitante, con navegación hacia adelante y hacia atrás entre páginas.
**Modos de vista.** La vista previa puede mostrar el formulario activo, la confirmación después del envío y el mensaje de cierre, y la confirmación y el mensaje de cierre recurren a un valor predeterminado cuando la organización no ha escrito uno.
**Cuando está vacío.** Un formulario sin campos muestra un estado vacío en la vista previa.`)
};

/**
* | output |
* | --- |
* | "The preview renders the form using the same field renderer the public intake page uses, so the editing view matches what the visitor sees when submitting. Wh..." |
*
* @param {Demo_Narrative_Admin_Form_Preview_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_preview_body = /** @type {((inputs?: Demo_Narrative_Admin_Form_Preview_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Form_Preview_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_form_preview_body(inputs)
	return en_demo_narrative_admin_form_preview_body(inputs)
});