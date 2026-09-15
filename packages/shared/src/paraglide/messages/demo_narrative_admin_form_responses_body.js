/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Form_Responses_BodyInputs */

const en_demo_narrative_admin_form_responses_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Responses_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Submitted intake forms appear as cards in the response viewer. Each card shows the fields the visitor filled in.
**Decryption.** Field values are encrypted at submission time and decrypted in the browser when the viewer loads. The same descrambling animation used on ticket titles plays as each card decrypts.
**Field layout.** Each card lists the field label and the visitor's answer in rows. Fields the visitor left blank are omitted, and the card header shows the submission date.`)
};

const es_demo_narrative_admin_form_responses_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Responses_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los formularios de admisión enviados aparecen como tarjetas en el visor de respuestas. Cada tarjeta muestra los campos que el visitante completó.
**Descifrado.** Los valores de los campos se cifran en el momento del envío y se descifran en el navegador cuando el visor se carga. La misma animación de descifrado usada en los títulos de tickets se reproduce mientras cada tarjeta se descifra.
**Diseño de campos.** Cada tarjeta lista la etiqueta del campo y la respuesta del visitante en filas. Los campos que el visitante dejó en blanco se omiten, y el encabezado de la tarjeta muestra la fecha de envío.`)
};

/**
* | output |
* | --- |
* | "Submitted intake forms appear as cards in the response viewer. Each card shows the fields the visitor filled in. **Decryption.** Field values are encrypted a..." |
*
* @param {Demo_Narrative_Admin_Form_Responses_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_responses_body = /** @type {((inputs?: Demo_Narrative_Admin_Form_Responses_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Form_Responses_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_form_responses_body(inputs)
	return en_demo_narrative_admin_form_responses_body(inputs)
});