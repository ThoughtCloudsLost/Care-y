/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Form_Locales_BodyInputs */

const en_demo_narrative_admin_form_locales_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Locales_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Every form carries English and Spanish text side by side, and a count beside a language shows how many of the form's translatable items have been filled in that language against the current total. [[#client-data]]
**What does the count include?** A field label counts because a field always needs one. Help text counts once it is written in English, the form's base language, and the same rule applies to the form's description, its confirmation message and its closed message. The total grows as the form is written rather than starting at a fixed number. Option labels in a pick field count separately, one apiece. [[#client-data]]
**What happens when a translation is missing?** When one language has no text for a field, the English version fills in. A partly translated form renders complete, and a visitor sees the English label wherever the second language has no entry. Rich text fields use the same fallback, and the 30,000-character cap per language applies to the stored form of the rich text, so the visible text that fits is less. [[#failure-states #portal]]
**Why are these separate from the interface languages?** The languages a form can be written in are their own list, separate from the languages the app is translated into. Adding an interface language does not add a language to the form builder, and a new release cannot leave a form half-translated. [Language selection](#settings/language) covers the interface language and what the server stores of that choice. [[#client-data]]
**The preview's own language toggle.** The preview keeps its own language selection, independent of the language being edited. [Live preview](#admin-forms/preview) covers the rest of the preview. [[#client-data]]
**The completeness function and the locale list.** \`computeLocaleCompleteness\` in \`packages/client/src/lib/components/admin/intake-form-editor-logic.ts\` is a pure function over the form's working copy, so the count runs entirely in the browser. The list of authoring languages is \`FORM_LOCALES\` in \`packages/shared/src/schemas/intake-forms.ts\`, with \`BASE_LOCALE\` naming the fallback language, and \`resolveLocalized\` beside it is the single reader both the builder and the public page use. [[#client-data]]`)
};

const es_demo_narrative_admin_form_locales_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Locales_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada formulario lleva texto en inglés y en español en paralelo, y un recuento junto a un idioma muestra cuántos elementos traducibles del formulario se han completado en ese idioma contra el total actual. [[#client-data]]
**¿Qué incluye el recuento?** La etiqueta de un campo cuenta porque todo campo necesita una. El texto de ayuda cuenta una vez escrito en inglés, el idioma base del formulario, y la misma regla se aplica a la descripción del formulario, su mensaje de confirmación y su mensaje de cierre. El total crece a medida que se escribe el formulario en lugar de partir de un número fijo. Las etiquetas de las opciones en un campo de selección cuentan por separado, una cada una. [[#client-data]]
**¿Qué pasa cuando falta una traducción?** Cuando un idioma no tiene texto para un campo, la versión en inglés lo suple. Un formulario traducido en parte se presenta completo, y el visitante ve la etiqueta en inglés donde el segundo idioma no tiene entrada. Los campos de texto enriquecido usan el mismo respaldo, y el tope de 30.000 caracteres por idioma se aplica a la forma almacenada del texto enriquecido, así que el texto visible que cabe es menor. [[#failure-states #portal]]
**¿Por qué son distintos de los idiomas de la interfaz?** Los idiomas en los que se puede escribir un formulario son una lista propia, aparte de los idiomas a los que está traducida la aplicación. Añadir un idioma de interfaz no añade un idioma al constructor de formularios, y una versión nueva no puede dejar un formulario medio traducido. [Selección de idioma](#settings/language) trata el idioma de la interfaz y lo que el servidor almacena de esa elección. [[#client-data]]
**Selector de idioma propio en la vista previa.** La vista previa mantiene su propia selección de idioma, independiente del idioma que se está editando. [Vista previa en vivo](#admin-forms/preview) trata el resto de la vista previa. [[#client-data]]
**La función de completitud y la lista de idiomas.** \`computeLocaleCompleteness\`, en \`packages/client/src/lib/components/admin/intake-form-editor-logic.ts\`, es una función pura sobre la copia de trabajo del formulario, así que el recuento se ejecuta enteramente en el navegador. La lista de idiomas de redacción es \`FORM_LOCALES\`, en \`packages/shared/src/schemas/intake-forms.ts\`, con \`BASE_LOCALE\` como el idioma de respaldo, y \`resolveLocalized\` a su lado es el único lector que usan tanto el constructor como la página pública. [[#client-data]]`)
};

const en_xa2_demo_narrative_admin_form_locales_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Locales_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èvèry fòrm càrrìès Ènglìsh ànd Spànìsh tèxt sìdè by sìdè, ànd à còùnt bèsìdè à làngùàgè shòws hòw màny òf thè fòrm's trànslàtàblè ìtèms hàvè bèèn fìllèd ìn thàt làngùàgè àgàìnst thè cùrrènt tòtàl. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè còùnt ìnclùdè? •••••••••** À fìèld làbèl còùnts bècàùsè à fìèld àlwàys nèèds ònè. Hèlp tèxt còùnts òncè ìt ìs wrìttèn ìn Ènglìsh, thè fòrm's bàsè làngùàgè, ànd thè sàmè rùlè àpplìès tò thè fòrm's dèscrìptìòn, ìts cònfìrmàtìòn mèssàgè ànd ìts clòsèd mèssàgè. Thè tòtàl gròws às thè fòrm ìs wrìttèn ràthèr thàn stàrtìng àt à fìxèd nùmbèr. Òptìòn làbèls ìn à pìck fìèld còùnt sèpàràtèly, ònè àpìècè. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt hàppèns whèn à trànslàtìòn ìs mìssìng? •••••••••••••** Whèn ònè làngùàgè hàs nò tèxt fòr à fìèld, thè Ènglìsh vèrsìòn fìlls ìn. À pàrtly trànslàtèd fòrm rèndèrs còmplètè, ànd à vìsìtòr sèès thè Ènglìsh làbèl whèrèvèr thè sècònd làngùàgè hàs nò èntry. Rìch tèxt fìèlds ùsè thè sàmè fàllbàck, ànd thè 30,000-chàràctèr càp pèr làngùàgè àpplìès tò thè stòrèd fòrm òf thè rìch tèxt, sò thè vìsìblè tèxt thàt fìts ìs lèss. [[#fàìlùrè-stàtès #pòrtàl]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Why àrè thèsè sèpàràtè fròm thè ìntèrfàcè làngùàgès? ••••••••••••••••** Thè làngùàgès à fòrm càn bè wrìttèn ìn àrè thèìr òwn lìst, sèpàràtè fròm thè làngùàgès thè àpp ìs trànslàtèd ìntò. Àddìng àn ìntèrfàcè làngùàgè dòès nòt àdd à làngùàgè tò thè fòrm bùìldèr, ànd à nèw rèlèàsè cànnòt lèàvè à fòrm hàlf-trànslàtèd. [Làngùàgè sèlèctìòn](#sèttìngs/làngùàgè) còvèrs thè ìntèrfàcè làngùàgè ànd whàt thè sèrvèr stòrès òf thàt chòìcè. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè prèvìèw's òwn làngùàgè tògglè. •••••••••••** Thè prèvìèw kèèps ìts òwn làngùàgè sèlèctìòn, ìndèpèndènt òf thè làngùàgè bèìng èdìtèd. [Lìvè prèvìèw](#àdmìn-fòrms/prèvìèw) còvèrs thè rèst òf thè prèvìèw. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè còmplètènèss fùnctìòn ànd thè lòcàlè lìst. ••••••••••••••** \`còmpùtèLòcàlèCòmplètènèss\` ìn \`pàckàgès/clìènt/src/lìb/còmpònènts/àdmìn/ìntàkè-fòrm-èdìtòr-lògìc.ts\` ìs à pùrè fùnctìòn òvèr thè fòrm's wòrkìng còpy, sò thè còùnt rùns èntìrèly ìn thè bròwsèr. Thè lìst òf àùthòrìng làngùàgès ìs \`FÒRM_LÒCÀLÈS\` ìn \`pàckàgès/shàrèd/src/schèmàs/ìntàkè-fòrms.ts\`, wìth \`BÀSÈ_LÒCÀLÈ\` nàmìng thè fàllbàck làngùàgè, ànd \`rèsòlvèLòcàlìzèd\` bèsìdè ìt ìs thè sìnglè rèàdèr bòth thè bùìldèr ànd thè pùblìc pàgè ùsè. [[#clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Every form carries English and Spanish text side by side, and a count beside a language shows how many of the form's translatable items have been filled in t..." |
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