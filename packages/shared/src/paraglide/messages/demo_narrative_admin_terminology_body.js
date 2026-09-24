/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Terminology_BodyInputs */

const en_demo_narrative_admin_terminology_body = /** @type {(inputs: Demo_Narrative_Admin_Terminology_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organizations rename the words the interface uses for the people in it and the work it holds, in six groups that each carry a singular and a plural, except the knowledge base group, which is one word. Each group is set separately for English and Spanish, and both sets are stored together. [[#privacy]]
**What this documentation calls them.** The handbook uses the shipped words, ticket, queue, volunteer and client, rather than any one organization's, because it documents CARE-Y instead of one deployment. An organization reading its own words in the app is reading this configuration. [[#client-data]]
**Singular, plural and reset.** Typing a singular fills in the plural by rule until the plural is edited by hand, and the editor works out which plurals were set by hand by comparing each against what the rule would have produced. Reset restores the defaults for the language being edited and leaves the other language alone. A save applies the new words across the interface without a reload. [[#client-data]]
**Why the words are encrypted and the support label is not.** The six groups are encrypted in the browser under the organization key and stored as one opaque blob the server writes without reading, because what an organization calls the people it serves says what the organization is for. The support label a visitor reads on the portal is stored in the clear beside it, on the same reasoning as the rest of the public branding: a visitor sees it before authenticating, so it cannot be behind a key. [How encryption works](#deep-dive/how-encryption-works) covers the organization key. [[#encryption #server-holds]]
**Who can rename things.** Editing terminology requires the Manage organization identity permission. [[#permissions]]
**The terminology blob and the words it feeds.** The ciphertext is \`org_config.encrypted_terminology\`, added in \`packages/server/src/db/migrations/tenant/072_add_terminology_config.ts\` and written through the same \`saveBrandingField\` procedure the plaintext branding fields use, with the JSON encrypted in the browser first. The reading side is \`packages/client/src/lib/terminology/\`, whose cache is cleared and refilled on a save so every screen picks the new words up together. [[#encryption #client-data]]`)
};

const es_demo_narrative_admin_terminology_body = /** @type {(inputs: Demo_Narrative_Admin_Terminology_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las organizaciones renombran las palabras que la interfaz usa para las personas que la componen y para el trabajo que guarda, en seis grupos que llevan cada uno un singular y un plural, salvo el grupo de la base de conocimiento, que es una sola palabra. Cada grupo se configura por separado en inglés y en español, y ambos conjuntos se guardan juntos. [[#privacy]]
**Cómo las llama esta documentación.** El manual usa las palabras de fábrica, ticket, cola, persona voluntaria y cliente, y no las de una organización concreta, porque documenta CARE-Y y no una instalación. Una organización que lee sus propias palabras en la aplicación está leyendo esta configuración. [[#client-data]]
**Singular, plural y restablecer.** Al escribir un singular se rellena el plural por regla hasta que el plural se edita a mano, y el editor deduce qué plurales se pusieron a mano comparando cada uno con lo que la regla habría producido. Restablecer devuelve los valores predeterminados del idioma que se está editando y deja el otro idioma como estaba. Un guardado aplica las palabras nuevas en toda la interfaz sin recargar. [[#client-data]]
**Por qué las palabras van cifradas y la etiqueta de apoyo no.** Los seis grupos se cifran en el navegador con la clave de la organización y se guardan como un único bloque opaco que el servidor escribe sin leer, porque cómo llama una organización a las personas a las que atiende dice para qué existe esa organización. La etiqueta de apoyo que un visitante lee en el portal se guarda en claro al lado, por el mismo razonamiento que el resto de la marca pública: el visitante la ve antes de autenticarse, así que no puede estar detrás de una clave. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) explica cómo funciona la clave de la organización. [[#encryption #server-holds]]
**Quién puede renombrar las cosas.** Editar la terminología requiere el permiso de gestionar la identidad de la organización. [[#permissions]]
**El bloque de terminología y las palabras que alimenta.** El texto cifrado es \`org_config.encrypted_terminology\`, añadido en \`packages/server/src/db/migrations/tenant/072_add_terminology_config.ts\` y escrito por el mismo procedimiento \`saveBrandingField\` que usan los campos de marca en texto plano, con el JSON cifrado antes en el navegador. El lado que lee es \`packages/client/src/lib/terminology/\`, cuya caché se vacía y se rellena al guardar para que todas las pantallas recojan juntas las palabras nuevas. [[#encryption #client-data]]`)
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
* | "Organizations rename the words the interface uses for the people in it and the work it holds, in six groups that each carry a singular and a plural, except t..." |
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