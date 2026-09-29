/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Terminology_BodyInputs */

const en_demo_narrative_admin_terminology_body = /** @type {(inputs: Demo_Narrative_Admin_Terminology_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The terminology editor lets an organization rename the words the interface uses for its people and work. Each group is configured separately for English and Spanish, and both language sets are saved together. The groups that carry a singular and a plural are:
- Team member role
- Senior team member role
- Person helped
- Work item
- Work group
The reference library group carries one word. The browser encrypts the groups under the organization key and stores them as a single ciphertext blob the server writes without reading, because what an organization calls the people it serves reveals what the organization does. [[#privacy #encryption]]
**Why does the handbook use "ticket", "queue" and "volunteer"?** The handbook uses the shipped defaults rather than any one organization's terminology, because it documents CARE-Y itself. When an organization sees its own words in the app, that text comes from this configuration. [[#admin-org]]
**Auto-pluralization and reset.** Typing a singular fills the plural automatically until the user edits the plural by hand. The editor detects a hand-edited plural by comparing it against the rule's output. Reset restores the defaults for the language being edited and leaves the other language unchanged. Saving applies the new words across the interface without a reload. [[#client-data]]
**What does the server hold?** The groups are one encrypted value the server cannot read. The support label that a visitor sees on the portal is stored in the clear on the same row, because a visitor reaches it before authenticating and cannot hold a key. [How encryption works](#deep-dive/how-encryption-works) covers the organization key. [[#encryption #server-holds]]
**Who can edit terminology?** Editing terminology requires the Manage org identity permission, the same grant that covers [General info](#admin-org/general) and [Branding](#admin-org/branding). [[#permissions]]
**The terminology column and the write path.** The ciphertext is \`org_config.encrypted_terminology\`, a \`bytea\` column added in \`packages/server/src/db/migrations/tenant/072_add_terminology_config.ts\` and written through the \`saveBrandingField\` procedure with JSON encrypted in the browser first. The reading side is \`packages/client/src/lib/terminology/\`. A Svelte context that feeds every screen reads the terminology on save. [[#encryption #client-data]]`)
};

const es_demo_narrative_admin_terminology_body = /** @type {(inputs: Demo_Narrative_Admin_Terminology_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El editor de terminología permite a una organización renombrar las palabras que la interfaz usa para sus personas y su trabajo. Cada grupo se configura por separado en inglés y en español, y ambos conjuntos de idiomas se guardan juntos. Los grupos que llevan un singular y un plural son:
- Rol de integrante del equipo
- Rol de integrante sénior
- Persona atendida
- Unidad de trabajo
- Grupo de trabajo
El grupo de la biblioteca de referencia lleva una sola palabra. El navegador cifra los grupos con la clave de la organización y los almacena como un solo bloque de texto cifrado que el servidor escribe sin leer, porque el modo en que una organización llama a las personas a las que atiende revela a qué se dedica. [[#privacy #encryption]]
**¿Por qué el manual usa "ticket", "cola" y "voluntario"?** El manual usa las palabras predeterminadas en lugar de la terminología de una organización concreta, porque documenta CARE-Y en sí. Cuando una organización ve sus propias palabras en la aplicación, ese texto proviene de esta configuración. [[#admin-org]]
**Pluralización automática y restablecimiento.** Al escribir un singular se rellena el plural automáticamente hasta que la persona usuaria edita el plural a mano. El editor detecta un plural editado a mano comparándolo con lo que la regla habría producido. Restablecer devuelve los valores predeterminados del idioma que se está editando y deja el otro idioma como estaba. Guardar aplica las palabras nuevas en toda la interfaz sin recargar. [[#client-data]]
**¿Qué guarda el servidor?** Los grupos son un solo valor cifrado que el servidor no puede leer. La etiqueta de apoyo que un visitante ve en el portal se guarda en claro en la misma fila, porque el visitante llega antes de autenticarse y no puede tener una clave. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata la clave de la organización. [[#encryption #server-holds]]
**¿Quién puede editar la terminología?** Editar la terminología requiere el permiso Gestionar identidad de la organización, la misma concesión que cubre [Información general](#admin-org/general) y [Marca](#admin-org/branding). [[#permissions]]
**La columna de terminología y la ruta de escritura.** El texto cifrado es \`org_config.encrypted_terminology\`, una columna \`bytea\` añadida en \`packages/server/src/db/migrations/tenant/072_add_terminology_config.ts\` y escrita a través del procedimiento \`saveBrandingField\` con el JSON cifrado en el navegador primero. El lado que lee es \`packages/client/src/lib/terminology/\`. Un contexto de Svelte que alimenta cada pantalla lee la terminología al guardar. [[#encryption #client-data]]`)
};

const en_xa2_demo_narrative_admin_terminology_body = /** @type {(inputs: Demo_Narrative_Admin_Terminology_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè tèrmìnòlògy èdìtòr lèts àn òrgànìzàtìòn rènàmè thè wòrds thè ìntèrfàcè ùsès fòr ìts pèòplè ànd wòrk. Èàch gròùp ìs cònfìgùrèd sèpàràtèly fòr Ènglìsh ànd Spànìsh, ànd bòth làngùàgè sèts àrè sàvèd tògèthèr. Thè gròùps thàt càrry à sìngùlàr ànd à plùràl àrè:
- Tèàm mèmbèr ròlè
- Sènìòr tèàm mèmbèr ròlè
- Pèrsòn hèlpèd
- Wòrk ìtèm
- Wòrk gròùp
Thè rèfèrèncè lìbràry gròùp càrrìès ònè wòrd. Thè bròwsèr èncrypts thè gròùps ùndèr thè òrgànìzàtìòn kèy ànd stòrès thèm às à sìnglè cìphèrtèxt blòb thè sèrvèr wrìtès wìthòùt rèàdìng, bècàùsè whàt àn òrgànìzàtìòn càlls thè pèòplè ìt sèrvès rèvèàls whàt thè òrgànìzàtìòn dòès. [[#prìvàcy #èncryptìòn]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Why dòès thè hàndbòòk ùsè "tìckèt", "qùèùè" ànd "vòlùntèèr"? ••••••••••••••••••** Thè hàndbòòk ùsès thè shìppèd dèfàùlts ràthèr thàn àny ònè òrgànìzàtìòn's tèrmìnòlògy, bècàùsè ìt dòcùmènts CÀRÈ-Y ìtsèlf. Whèn àn òrgànìzàtìòn sèès ìts òwn wòrds ìn thè àpp, thàt tèxt còmès fròm thìs cònfìgùràtìòn. [[#àdmìn-òrg]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Àùtò-plùràlìzàtìòn ànd rèsèt. •••••••••** Typìng à sìngùlàr fìlls thè plùràl àùtòmàtìcàlly ùntìl thè ùsèr èdìts thè plùràl by hànd. Thè èdìtòr dètècts à hànd-èdìtèd plùràl by còmpàrìng ìt àgàìnst thè rùlè's òùtpùt. Rèsèt rèstòrès thè dèfàùlts fòr thè làngùàgè bèìng èdìtèd ànd lèàvès thè òthèr làngùàgè ùnchàngèd. Sàvìng àpplìès thè nèw wòrds àcròss thè ìntèrfàcè wìthòùt à rèlòàd. [[#clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè sèrvèr hòld? ••••••••** Thè gròùps àrè ònè èncryptèd vàlùè thè sèrvèr cànnòt rèàd. Thè sùppòrt làbèl thàt à vìsìtòr sèès òn thè pòrtàl ìs stòrèd ìn thè clèàr òn thè sàmè ròw, bècàùsè à vìsìtòr rèàchès ìt bèfòrè àùthèntìcàtìng ànd cànnòt hòld à kèy. [Hòw èncryptìòn wòrks](#dèèp-dìvè/hòw-èncryptìòn-wòrks) còvèrs thè òrgànìzàtìòn kèy. [[#èncryptìòn #sèrvèr-hòlds]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whò càn èdìt tèrmìnòlògy? ••••••••** Èdìtìng tèrmìnòlògy rèqùìrès thè Mànàgè òrg ìdèntìty pèrmìssìòn, thè sàmè grànt thàt còvèrs [Gènèràl ìnfò](#àdmìn-òrg/gènèràl) ànd [Bràndìng](#àdmìn-òrg/bràndìng). [[#pèrmìssìòns]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè tèrmìnòlògy còlùmn ànd thè wrìtè pàth. •••••••••••••** Thè cìphèrtèxt ìs \`òrg_cònfìg.èncryptèd_tèrmìnòlògy\`, à \`bytèà\` còlùmn àddèd ìn \`pàckàgès/sèrvèr/src/db/mìgràtìòns/tènànt/072_àdd_tèrmìnòlògy_cònfìg.ts\` ànd wrìttèn thròùgh thè \`sàvèBràndìngFìèld\` pròcèdùrè wìth JSÒN èncryptèd ìn thè bròwsèr fìrst. Thè rèàdìng sìdè ìs \`pàckàgès/clìènt/src/lìb/tèrmìnòlògy/\`. À Svèltè còntèxt thàt fèèds èvèry scrèèn rèàds thè tèrmìnòlògy òn sàvè. [[#èncryptìòn #clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The terminology editor lets an organization rename the words the interface uses for its people and work. Each group is configured separately for English and ..." |
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