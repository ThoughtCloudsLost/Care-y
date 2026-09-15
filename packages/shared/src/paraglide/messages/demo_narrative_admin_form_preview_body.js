/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Form_Preview_BodyInputs */

const en_demo_narrative_admin_form_preview_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Preview_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The preview pane renders the form as a visitor would see it, updating as fields are added or edited.
**State switcher.** A segmented control at the top of the preview cycles between the active form, the submission confirmation, and the closed message. Administrators can check all three states without publishing.
**Multi-page preview.** When the form has page breaks, the preview shows the same forward and back navigation the visitor will use. Switching pages in the preview does not affect which field is selected in the editor.
**Banner.** If a banner image has been uploaded, it appears at the top of the preview in every state.`)
};

const es_demo_narrative_admin_form_preview_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Preview_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El panel de vista previa renderiza el formulario tal como lo vería un visitante, actualizándose a medida que se añaden o editan campos.
**Selector de estado.** Un control segmentado en la parte superior de la vista previa alterna entre el formulario activo, la confirmación de envío y el mensaje de cierre. Los administradores pueden verificar los tres estados sin publicar.
**Vista previa multipágina.** Cuando el formulario tiene saltos de página, la vista previa muestra la misma navegación hacia adelante y atrás que usará el visitante. Cambiar de página en la vista previa no afecta al campo seleccionado en el editor.
**Banner.** Si se ha subido una imagen de banner, aparece en la parte superior de la vista previa en todos los estados.`)
};

/**
* | output |
* | --- |
* | "The preview pane renders the form as a visitor would see it, updating as fields are added or edited. **State switcher.** A segmented control at the top of th..." |
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