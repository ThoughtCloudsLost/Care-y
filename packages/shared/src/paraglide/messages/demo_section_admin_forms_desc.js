/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Forms_DescInputs */

const en_demo_section_admin_forms_desc = /** @type {(inputs: Demo_Section_Admin_Forms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The form builder is where the user authors, translates, previews and configures intake forms. Field labels, descriptions, messages and banner images are all readable by anyone who opens the form's public address. Answers are encrypted per case to individual accounts and cannot be read by the server. [How encryption works](#deep-dive/how-encryption-works) covers the two key trees, and [The permission system](#deep-dive/the-permission-system) covers the separation between editing forms and reading answers.`)
};

const es_demo_section_admin_forms_desc = /** @type {(inputs: Demo_Section_Admin_Forms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El constructor de formularios es donde la persona usuaria crea, traduce, previsualiza y configura los formularios de admisión. Las etiquetas de campo, las descripciones, los mensajes y las imágenes de portada son legibles para cualquier persona que abra la dirección pública del formulario. Las respuestas se cifran por caso para cuentas individuales y el servidor no puede leerlas. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata los dos árboles de claves, y [El sistema de permisos](#deep-dive/the-permission-system) trata la separación entre editar formularios y leer respuestas.`)
};

const en_xa2_demo_section_admin_forms_desc = /** @type {(inputs: Demo_Section_Admin_Forms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè fòrm bùìldèr ìs whèrè thè ùsèr àùthòrs, trànslàtès, prèvìèws ànd cònfìgùrès ìntàkè fòrms. Fìèld làbèls, dèscrìptìòns, mèssàgès ànd bànnèr ìmàgès àrè àll rèàdàblè by ànyònè whò òpèns thè fòrm's pùblìc àddrèss. Ànswèrs àrè èncryptèd pèr càsè tò ìndìvìdùàl àccòùnts ànd cànnòt bè rèàd by thè sèrvèr. [Hòw èncryptìòn wòrks](#dèèp-dìvè/hòw-èncryptìòn-wòrks) còvèrs thè twò kèy trèès, ànd [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs thè sèpàràtìòn bètwèèn èdìtìng fòrms ànd rèàdìng ànswèrs. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The form builder is where the user authors, translates, previews and configures intake forms. Field labels, descriptions, messages and banner images are all ..." |
*
* @param {Demo_Section_Admin_Forms_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_forms_desc = /** @type {((inputs?: Demo_Section_Admin_Forms_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_Forms_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_forms_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_admin_forms_desc(inputs)
	return en_demo_section_admin_forms_desc(inputs)
});