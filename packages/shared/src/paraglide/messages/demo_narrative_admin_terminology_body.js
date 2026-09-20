/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Terminology_BodyInputs */

const en_demo_narrative_admin_terminology_body = /** @type {(inputs: Demo_Narrative_Admin_Terminology_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organizations rename the standard terms used throughout the interface to match their own language. Six term groups are available, each with a singular and a plural except the knowledge base group, and each group can be set independently for English and Spanish.
**How it works.** Typing a singular fills in the plural until the plural field is edited by hand, and the sheet detects which plurals were manually set by comparing them against what the rule would produce. Reset restores the defaults for the language currently selected without touching the other, and saving applies the new words across the interface immediately without a reload.
**Encryption.** The terminology configuration is encrypted under the organization key in the browser, while the support label shown to the visitor on the portal is stored as plaintext because the visitor sees it before authenticating.
**Permissions.** Editing terminology requires the Manage organization identity permission.`)
};

const es_demo_narrative_admin_terminology_body = /** @type {(inputs: Demo_Narrative_Admin_Terminology_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las organizaciones renombran los términos estándar usados en toda la interfaz para adaptarlos a su propio lenguaje. Hay seis grupos de términos disponibles, cada uno con singular y plural excepto el grupo de la base de conocimiento, y cada grupo se puede configurar de forma independiente para inglés y español.
**Cómo funciona.** Al escribir un singular se completa automáticamente el plural hasta que el campo de plural se edita a mano, y la hoja detecta qué plurales fueron editados manualmente comparándolos con lo que produciría la regla. Restablecer restaura los valores predeterminados del idioma seleccionado sin tocar el otro, y guardar aplica las nuevas palabras en toda la interfaz de inmediato sin recargar.
**Cifrado.** La configuración de terminología se cifra con la clave de la organización en el navegador, mientras que la etiqueta de soporte que se muestra al visitante en el portal se almacena en texto plano porque el visitante la ve antes de autenticarse.
**Permisos.** Editar la terminología requiere el permiso Cambiar como se presenta la organización.`)
};

const en_xa2_demo_narrative_admin_terminology_body = /** @type {(inputs: Demo_Narrative_Admin_Terminology_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òrgànìzàtìòns rènàmè thè stàndàrd tèrms ùsèd thròùghòùt thè ìntèrfàcè tò màtch thèìr òwn làngùàgè. Sìx tèrm gròùps àrè àvàìlàblè, èàch wìth à sìngùlàr ànd à plùràl èxcèpt thè knòwlèdgè bàsè gròùp, ànd èàch gròùp càn bè sèt ìndèpèndèntly fòr Ènglìsh ànd Spànìsh.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw ìt wòrks. ••••** Typìng à sìngùlàr fìlls ìn thè plùràl ùntìl thè plùràl fìèld ìs èdìtèd by hànd, ànd thè shèèt dètècts whìch plùràls wèrè mànùàlly sèt by còmpàrìng thèm àgàìnst whàt thè rùlè wòùld pròdùcè. Rèsèt rèstòrès thè dèfàùlts fòr thè làngùàgè cùrrèntly sèlèctèd wìthòùt tòùchìng thè òthèr, ànd sàvìng àpplìès thè nèw wòrds àcròss thè ìntèrfàcè ìmmèdìàtèly wìthòùt à rèlòàd.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Thè tèrmìnòlògy cònfìgùràtìòn ìs èncryptèd ùndèr thè òrgànìzàtìòn kèy ìn thè bròwsèr, whìlè thè sùppòrt làbèl shòwn tò thè vìsìtòr òn thè pòrtàl ìs stòrèd às plàìntèxt bècàùsè thè vìsìtòr sèès ìt bèfòrè àùthèntìcàtìng.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Èdìtìng tèrmìnòlògy rèqùìrès thè Mànàgè òrgànìzàtìòn ìdèntìty pèrmìssìòn. •••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Organizations rename the standard terms used throughout the interface to match their own language. Six term groups are available, each with a singular and a ..." |
*
* @param {Demo_Narrative_Admin_Terminology_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_terminology_body = /** @type {((inputs?: Demo_Narrative_Admin_Terminology_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Terminology_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_terminology_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_terminology_body(inputs)
	return en_demo_narrative_admin_terminology_body(inputs)
});