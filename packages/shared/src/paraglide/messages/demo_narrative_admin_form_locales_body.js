/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Form_Locales_BodyInputs */

const en_demo_narrative_admin_form_locales_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Locales_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Form text is authored in English and Spanish, and the count beside each language reports how many translatable items in the form have content in it out of the number that exist at all. [[#client-data]]
**What the count counts.** A field label always counts, because a field always needs one. Help text counts only once it has been written in at least one language, and the same holds for the form's own description, its confirmation message and its closed message, so the total grows as the form is authored rather than standing as a fixed target from the start. Option labels count one apiece. [[#client-data]]
**What a missing translation does.** A field left blank in one language falls back to the English text, so a form translated in part still renders completely and a visitor never meets an empty label. Rich text bodies fall back the same way, and each language's rich text is capped at 30,000 bytes on its own rather than across the pair. [[#failure-states #portal]]
**Why these are not the interface languages.** The languages a form can be written in are their own list, separate from the languages the app itself is translated into, so adding an interface language does not add a language to the form builder and a form is not silently half-translated by a release. [Language selection](#settings/language) covers the interface side and what an account stores about it. [[#client-data]]
**Previewing one language while writing another.** The preview keeps its own language selection, independent of the one being edited, so the Spanish rendering can be checked while the English text is open. [Live preview](#admin-forms/preview) covers what else the preview answers. [[#client-data]]
**The completeness function and the locale list.** \`computeLocaleCompleteness\` in \`packages/client/src/lib/components/admin/intake-form-editor-logic.ts\` is the whole rule, and it is a pure function over the form's working copy, so the count owes nothing to the server. The list of authoring languages is \`FORM_LOCALES\` in \`packages/shared/src/schemas/intake-forms.ts\`, with \`BASE_LOCALE\` naming the one everything falls back to, and \`resolveLocalized\` beside them is the single reader both the builder and the public page use. [[#client-data]]`)
};

const es_demo_narrative_admin_form_locales_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Locales_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El texto de un formulario se redacta en inglés y en español, y el recuento junto a cada idioma indica cuántos elementos traducibles del formulario tienen contenido en ese idioma, del total de los que existen. [[#client-data]]
**Qué cuenta ese recuento.** La etiqueta de un campo cuenta siempre, porque un campo siempre necesita una. El texto de ayuda cuenta solo cuando se ha escrito en al menos un idioma, y lo mismo vale para la descripción del propio formulario, su mensaje de confirmación y su mensaje de cierre, de modo que el total crece a medida que se redacta el formulario en lugar de ser una meta fija desde el principio. Las etiquetas de las opciones cuentan una cada una. [[#client-data]]
**Qué pasa cuando falta una traducción.** Un campo en blanco en un idioma recurre al texto en inglés, así que un formulario traducido en parte se sigue presentando completo y un visitante nunca se encuentra una etiqueta vacía. Los cuerpos de texto enriquecido recurren al mismo respaldo, y el texto enriquecido de cada idioma tiene un tope propio de 30.000 bytes, no uno compartido entre ambos. [[#failure-states #portal]]
**Por qué estos no son los idiomas de la interfaz.** Los idiomas en los que se puede escribir un formulario son una lista propia, aparte de los idiomas a los que está traducida la aplicación, de modo que añadir un idioma de interfaz no añade un idioma al constructor de formularios y una versión nueva no deja un formulario medio traducido sin avisar. [Selección de idioma](#settings/language) trata el lado de la interfaz y lo que una cuenta guarda al respecto. [[#client-data]]
**Ver un idioma mientras se escribe otro.** La vista previa mantiene su propia selección de idioma, independiente de la que se está editando, así que se puede revisar la presentación en español con el texto en inglés abierto. [Vista previa en vivo](#admin-forms/preview) trata lo demás que responde la vista previa. [[#client-data]]
**La función de completitud y la lista de idiomas.** \`computeLocaleCompleteness\`, en \`packages/client/src/lib/components/admin/intake-form-editor-logic.ts\`, es la regla entera, y es una función pura sobre la copia de trabajo del formulario, así que el recuento no le debe nada al servidor. La lista de idiomas de redacción es \`FORM_LOCALES\`, en \`packages/shared/src/schemas/intake-forms.ts\`, con \`BASE_LOCALE\` nombrando aquel al que todo recurre, y \`resolveLocalized\`, a su lado, es el único lector que usan tanto el constructor como la página pública. [[#client-data]]`)
};

const en_xa2_demo_narrative_admin_form_locales_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Locales_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè còmplètènèss còùnt fòr èàch lòcàlè tràcks hòw màny trànslàtàblè ìtèms hàvè bèèn fìllèd òùt òf thè tòtàl, ànd thè tòtàl còùnts ònly ìtèms thàt èxìst ìn àt lèàst ònè lòcàlè, sò ìt gròws às thè fòrm ìs àùthòrèd. Hèlp tèxt còùnts ònly whèn ìt hàs bèèn wrìttèn sòmèwhèrè, whìlè à fìèld làbèl àlwàys còùnts bècàùsè ìt ìs àlwàys rèqùìrèd.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Fàllbàck. •••** À fìèld lèft blànk ìn à trànslàtèd lòcàlè ùsès thè bàsè làngùàgè ìnstèàd, sò à fòrm wìth pàrtìàl trànslàtìòns stìll rèndèrs còmplètèly.
 ••••••••••••••••••••••••••••••••••••••••••**Prèvìèw. •••** Thè prèvìèw pànè hàs ìts òwn lòcàlè swìtchèr, ìndèpèndènt òf thè èdìtòr's, sò ònè làngùàgè càn bè èdìtèd whìlè prèvìèwìng ànòthèr. ••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Form text is authored in English and Spanish, and the count beside each language reports how many translatable items in the form have content in it out of th..." |
*
* @param {Demo_Narrative_Admin_Form_Locales_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_locales_body = /** @type {((inputs?: Demo_Narrative_Admin_Form_Locales_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Form_Locales_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_form_locales_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_form_locales_body(inputs)
	return en_demo_narrative_admin_form_locales_body(inputs)
});