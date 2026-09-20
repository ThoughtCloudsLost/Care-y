/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Form_Builder_BodyInputs */

const en_demo_narrative_admin_form_builder_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Builder_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The form editor saves as a whole, so changes to fields accumulate until the user saves the form.
**Removing.** Removing a field is immediate and has no confirmation, but the removal is not persisted until the form is saved.
**Field types.** Nine types are available, split between seven that collect answers and two structural elements that do not. The structural pair, page break and rich text, controls layout only, and a rich text row shows a preview of its body in place of a label.
**Encryption.** Field labels, configuration, and form metadata are encrypted under a key derived from the organization's public key, so the intake page can read the form without an account while a database dump stays opaque.`)
};

const es_demo_narrative_admin_form_builder_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Builder_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El editor de formularios guarda como un todo, de modo que los cambios en los campos se acumulan hasta que la persona usuaria guarda el formulario.
**Eliminar.** Eliminar un campo es inmediato y no tiene confirmación, pero la eliminación no se persiste hasta que se guarda el formulario.
**Tipos de campo.** Hay nueve tipos disponibles, divididos entre siete que recogen respuestas y dos elementos estructurales que no. El par estructural, salto de página y texto enriquecido, solo controla el diseño, y una fila de texto enriquecido muestra una vista previa de su contenido en lugar de una etiqueta.
**Cifrado.** Las etiquetas de campo, la configuración y los metadatos del formulario se cifran con una clave derivada de la clave pública de la organización, de modo que la página de admisión puede leer el formulario sin cuenta mientras que un volcado de base de datos permanece opaco.`)
};

const en_xa2_demo_narrative_admin_form_builder_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Builder_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè fòrm èdìtòr sàvès às à whòlè, sò chàngès tò fìèlds àccùmùlàtè ùntìl thè ùsèr sàvès thè fòrm.
 ••••••••••••••••••••••••••••••**Rèmòvìng. •••** Rèmòvìng à fìèld ìs ìmmèdìàtè ànd hàs nò cònfìrmàtìòn, bùt thè rèmòvàl ìs nòt pèrsìstèd ùntìl thè fòrm ìs sàvèd.
 •••••••••••••••••••••••••••••••••••**Fìèld typès. ••••** Nìnè typès àrè àvàìlàblè, splìt bètwèèn sèvèn thàt còllèct ànswèrs ànd twò strùctùràl èlèmènts thàt dò nòt. Thè strùctùràl pàìr, pàgè brèàk ànd rìch tèxt, còntròls làyòùt ònly, ànd à rìch tèxt ròw shòws à prèvìèw òf ìts bòdy ìn plàcè òf à làbèl.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Fìèld làbèls, cònfìgùràtìòn, ànd fòrm mètàdàtà àrè èncryptèd ùndèr à kèy dèrìvèd fròm thè òrgànìzàtìòn's pùblìc kèy, sò thè ìntàkè pàgè càn rèàd thè fòrm wìthòùt àn àccòùnt whìlè à dàtàbàsè dùmp stàys òpàqùè. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The form editor saves as a whole, so changes to fields accumulate until the user saves the form. **Removing.** Removing a field is immediate and has no confi..." |
*
* @param {Demo_Narrative_Admin_Form_Builder_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_builder_body = /** @type {((inputs?: Demo_Narrative_Admin_Form_Builder_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Form_Builder_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_form_builder_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_form_builder_body(inputs)
	return en_demo_narrative_admin_form_builder_body(inputs)
});